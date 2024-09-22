import cv2
import numpy as np

# Configurações YOLOv4
CONF_THRESHOLD = 0.5  # Limiar de confiança para detecção
NMS_THRESHOLD = 0.4   # Limiar de Non-Maxima Suppression

# Caminhos e arquivos YOLOv4
weights_path = "c:/Users/vanil/3-ANO/2_Semestre/Projecto 2/code/CV/yolov4.weights"
config_path = "c:/Users/vanil/3-ANO/2_Semestre/Projecto 2/code/CV/yolov4.cfg"
classes_file = "c:/Users/vanil/3-ANO/2_Semestre/Projecto 2/code/CV/coco.names"

def load_yolo(weights_path, config_path, classes_file):
    # Carregar modelo YOLOv4
    net = cv2.dnn.readNet(weights_path, config_path)
    
    # Carregar classes YOLOv4
    with open(classes_file, "r") as f:
        classes = f.read().splitlines()
    
    return net, classes

def detect_objects(img, net, classes):
    height, width, _ = img.shape
    
    # Detecção de objetos com YOLOv4
    blob = cv2.dnn.blobFromImage(img, 1/255, (416, 416), (0, 0, 0), swapRB=True, crop=False)
    net.setInput(blob)
    layer_outputs = net.forward(net.getUnconnectedOutLayersNames())

    boxes, confidences, class_ids = [], [], []

    # Processamento de detecções YOLOv4
    for output in layer_outputs:
        for detection in output:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            
            if confidence > CONF_THRESHOLD:
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)
                
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)
                
                boxes.append([x, y, w, h])
                confidences.append(float(confidence))
                class_ids.append(class_id)

    # Aplicar Non-Maxima Suppression para YOLOv4
    indexes = cv2.dnn.NMSBoxes(boxes, confidences, CONF_THRESHOLD, NMS_THRESHOLD)

    return boxes, confidences, class_ids, indexes

def draw_boxes(img, boxes, confidences, class_ids, indexes, classes):
    for i in range(len(boxes)):
        if i in indexes:
            x, y, w, h = boxes[i]
            label = str(classes[class_ids[i]])
            confidence = confidences[i]
            color = (0, 255, 0)
            
            # Desenhar caixa delimitadora YOLOv4
            cv2.rectangle(img, (x, y), (x + w, y + h), color, 2)
            
            # Escrever rótulo e confiança YOLOv4
            text = f"{label} {confidence:.2f}"
            cv2.putText(img, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

def detect_aruco_markers(img, aruco_dict, parameters):
    corners, ids, rejected_img_points = cv2.aruco.detectMarkers(img, aruco_dict, parameters=parameters)
    
    if ids is not None:
        cv2.aruco.drawDetectedMarkers(img, corners, ids)

    return img

def main():
    # Carregar modelo YOLOv4 e classes
    net, classes = load_yolo(weights_path, config_path, classes_file)
    
    # Configuração ArUco
    aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_1000)
    parameters = cv2.aruco.DetectorParameters()

    # Capturar vídeo da câmera
    cap = cv2.VideoCapture(0) 

    if not cap.isOpened():
        print("Erro ao abrir a câmera")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Falha ao capturar imagem")
            break

        # Detecção de objetos com YOLOv4
        boxes, confidences, class_ids, indexes = detect_objects(frame, net, classes)
        
        # Desenhar caixas delimitadoras e rótulos YOLOv4
        draw_boxes(frame, boxes, confidences, class_ids, indexes, classes)
        
        # Detecção de marcadores ArUco
        frame = detect_aruco_markers(frame, aruco_dict, parameters)
        
        cv2.imshow("Image", frame)
        
        key = cv2.waitKey(1)
        if key == 27:  # Tecla 'Esc' para sair
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
