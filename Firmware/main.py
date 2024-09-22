import cv2
import numpy as np
from datetime import datetime 
from ultralytics import YOLO
import paho.mqtt.client as mqtt
import json

# Configurações MQTT
MQTT_BROKER = "broker.hivemq.com"
MQTT_TOPIC = "object/movement"

# Cliente MQTT
mqtt_client = mqtt.Client()

# Configurações YOLOv8
CONF_THRESHOLD = 0.5  # Limiar de confiança para detecção
NMS_THRESHOLD = 0.4   # Limiar de Non-Maxima Suppression

# Caminhos e arquivos YOLOv8
weights_path = "c:/Users/vanil/3-ANO/2_Semestre/Romilsom_Projeto_2/Firmware/yolov8n.pt"
classes_file = "c:/Users/vanil/3-ANO/2_Semestre/Romilsom_Projeto_2/Firmware/coco.names"

# Tamanho desejado para os vídeos
VIDEO_WIDTH = 640
VIDEO_HEIGHT = 480

# Lista de vídeos com caminho e ID de localização
videos = [ {"path": 0, "Location_local_id": 17},

]

# Carregar classes
with open(classes_file, "r") as f:
    classes = f.read().splitlines()

# Função para redimensionar o frame de vídeo
def resize_frame(frame):
    return cv2.resize(frame, (VIDEO_WIDTH, VIDEO_HEIGHT))

# Função para detectar objetos usando YOLOv8
def detect_objects(model, img):
    results = model(img)
    boxes, confidences, class_ids = [], [], []

    for result in results:
        for bbox, score, class_id in zip(result.boxes.xyxy, result.boxes.conf, result.boxes.cls):
            if score > CONF_THRESHOLD and class_id != classes.index("pessoa"):
                x1, y1, x2, y2 = map(int, bbox)
                boxes.append([x1, y1, x2 - x1, y2 - y1])
                confidences.append(float(score))
                class_ids.append(int(class_id))
    return boxes, confidences, class_ids, list(range(len(boxes)))

# Função para desenhar caixas delimitadoras na imagem
def draw_boxes(img, boxes, confidences, class_ids, indexes, classes):
    for i in indexes:
        x, y, w, h = boxes[i]
        label = str(classes[class_ids[i]])
        confidence = confidences[i]
        color = (0, 255, 0)
        cv2.rectangle(img, (x, y), (x + w, y + h), color, 2)
        text = f"{label} {confidence:.2f}"
        cv2.putText(img, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

# Função para verificar se um ArUco está dentro de uma caixa delimitadora
def is_aruco_inside_box(aruco_corners, box):
    aruco_x, aruco_y, aruco_w, aruco_h = cv2.boundingRect(aruco_corners)
    box_x, box_y, box_w, box_h = box
    return (aruco_x >= box_x and aruco_y >= box_y and
            aruco_x + aruco_w <= box_x + box_w and aruco_y + aruco_h <= box_y + box_h)

# Função para calcular a sobreposição entre duas caixas delimitadoras
def calculate_overlap(box1, box2):
    x1, y1, w1, h1 = box1
    x2, y2, w2, h2 = box2
    xA = max(x1, x2)
    yA = max(y1, y2)
    xB = min(x1 + w1, x2 + w2)
    yB = min(y1 + h1, y2 + h2)
    interArea = max(0, xB - xA) * max(0, yB - yA)
    box1Area = w1 * h1
    box2Area = w2 * h2
    overlap = interArea / min(box1Area, box2Area)
    return overlap

# Função para desenhar texto com fundo
def draw_text_with_background(img, text, org, font, font_scale, color, thickness=1, background_color=None):
    (text_width, text_height), baseline = cv2.getTextSize(text, font, fontScale=font_scale, thickness=thickness)
    text_offset_x, text_offset_y = org
    box_coords = ((text_offset_x, text_offset_y + baseline - 2), (text_offset_x + text_width + 2, text_offset_y - text_height - 2))

    if background_color is not None:
        cv2.rectangle(img, box_coords[0], box_coords[1], background_color, cv2.FILLED)
    cv2.putText(img, text, org, font, font_scale, color, thickness)

# Função para enviar dados para o backend via API e salvar em arquivo
def send_data_to_backend(data):
    print(f"Dados enviados para o broker MQTT: {data}")
    global mqtt_client
    try:
        # Converte dados para JSON
        payload = json.dumps(data)

        # Publica mensagem no tópico MQTT
        mqtt_client.publish(MQTT_TOPIC, payload)
        print(f"Dados enviados para o broker MQTT: {data}")
    except Exception as e:
        print(f"Erro ao enviar dados via MQTT: {e}")

def main():
    mqtt_client.connect(MQTT_BROKER)
    mqtt_client.loop_start()

    # Inicializar modelos YOLOv8 para cada vídeo
    models = []
    caps = []

    for video in videos:
        model = YOLO(weights_path)
        models.append(model)
        cap = cv2.VideoCapture(video["path"])
        if not cap.isOpened():
            print(f"Erro ao abrir o vídeo: {video['path']}")
            caps.append(None)
        else:
            caps.append(cap)

    # Sair se nenhum vídeo estiver disponível
    if not any(caps):
        print("Nenhum vídeo disponível para leitura.")
        return

    # Dicionários para armazenar os últimos tempos de detecção dos ArUcos e as caixas delimitadoras
    last_detected = [{} for _ in range(len(videos))]

    # Variáveis para controle de taxa de envio
    min_interval = 2  # Intervalo mínimo entre as requisições (em segundos)
    last_sent_times = [None] * len(videos)

    # Nome da janela de vídeo combinado
    window_name = "Combined Video Feed"

    while True:
        frames = []
        rets = []
        
        # Capturar frame de cada vídeo
        for i, cap in enumerate(caps):
            if cap is None:
                frames.append(np.zeros((VIDEO_HEIGHT, VIDEO_WIDTH, 3), dtype=np.uint8))  # Frame preto para indicar vídeo indisponível
                draw_text_with_background(frames[-1], "Video indisponível", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), thickness=2, background_color=(0, 0, 0))
                rets.append(False)
                continue
            ret, frame = cap.read()
            if ret:
                frame_resized = resize_frame(frame)
                frames.append(frame_resized)
            else:
                print(f"Erro ao capturar frame do vídeo: {videos[i]['path']}")
                frames.append(np.zeros((VIDEO_HEIGHT, VIDEO_WIDTH, 3), dtype=np.uint8))  # Frame preto em caso de erro
                draw_text_with_background(frames[-1], "Video indisponível", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), thickness=2, background_color=(0, 0, 0))
                
            rets.append(ret)

        # Sair do loop se nenhum dos vídeos está mais disponível
        if not any(rets):
            break

        # Detecção de objetos com YOLOv8 para cada vídeo
        all_boxes, all_confidences, all_class_ids, all_indexes = [], [], [], []
        for i, model in enumerate(models):
            if rets[i]:
                boxes, confidences, class_ids, indexes = detect_objects(model, frames[i])
                draw_boxes(frames[i], boxes, confidences, class_ids, indexes, classes)
                all_boxes.append(boxes)
                all_confidences.append(confidences)
                all_class_ids.append(class_ids)
                all_indexes.append(indexes)
            else:
                all_boxes.append([])
                all_confidences.append([])
                all_class_ids.append([])
                all_indexes.append([])

        # Detectar ArUcos e associar com objetos detectados
        for i, frame in enumerate(frames):
            if rets[i]:
                aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_1000)
                parameters = cv2.aruco.DetectorParameters()
                corners, ids, rejected_img_points = cv2.aruco.detectMarkers(frame, aruco_dict, parameters=parameters)
                if ids is not None:
                    cv2.aruco.drawDetectedMarkers(frame, corners, ids)

                # Associando ArUcos com objetos detectados e enviando dados para o backend se o intervalo mínimo tiver passado usando MQTT
                current_time = datetime.now()
                for j, corner in enumerate(corners):
                    for k, box in enumerate(all_boxes[i]):
                        if is_aruco_inside_box(corner, box):
                            aruco_id = ids[j][0]
                            box = all_boxes[i][k]
                            data = {
                                "object_class": classes[all_class_ids[i][k]],
                                "confidence": float(all_confidences[i][k]),
                                "aruco_id": int(aruco_id),
                                "box": [int(coord) for coord in box],
                                "timestamp": current_time.isoformat(),
                                "Location_local_id": videos[i]["Location_local_id"]
                            }
                            # Enviar dados para o backend se o intervalo mínimo tiver passado usando MQTT   
                            if last_sent_times[i] is None or (current_time - last_sent_times[i]).total_seconds() >= min_interval:
                                send_data_to_backend(data)
                                last_sent_times[i] = current_time
                            last_detected[i][aruco_id] = {'time': current_time, 'box': box}

        # Desenhar informações na imagem combinada
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        for i, frame in enumerate(frames):
            draw_text_with_background(frame, f"Location ID: {videos[i]['Location_local_id']} - {current_time}", (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), background_color=(0, 0, 0))

        combined_frame = np.hstack(frames)  # Combinar todos os frames horizontalmente
        cv2.imshow(window_name, combined_frame)

        # Detectar tecla 'Esc' para sair
        key = cv2.waitKey(1)
        if key == 27:
            break

    # Liberar recursos
    for cap in caps:
        if cap is not None:
            cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
