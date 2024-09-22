function generateMarkerSvg(width, height, bits, fixPdfArtifacts = true) {
    var svg = document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 ' + (width + 2) + ' ' + (height + 2));
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('shape-rendering', 'crispEdges');

    // Background rect
    var rect = document.createElement('rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', width + 2);
    rect.setAttribute('height', height + 2);
    rect.setAttribute('fill', 'black');
    svg.appendChild(rect);

    // "Pixels"
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var white = bits[i * height + j];
            if (!white) continue;

            var pixel = document.createElement('rect');;
            pixel.setAttribute('width', 1);
            pixel.setAttribute('height', 1);
            pixel.setAttribute('x', j + 1);
            pixel.setAttribute('y', i + 1);
            pixel.setAttribute('fill', 'white');
            svg.appendChild(pixel);

            if (!fixPdfArtifacts) continue;

            if ((j < width - 1) && (bits[i * height + j + 1])) {
                pixel.setAttribute('width', 1.5);
            }

            if ((i < height - 1) && (bits[(i + 1) * height + j])) {
                var pixel2 = document.createElement('rect');;
                pixel2.setAttribute('width', 1);
                pixel2.setAttribute('height', 1.5);
                pixel2.setAttribute('x', j + 1);
                pixel2.setAttribute('y', i + 1);
                pixel2.setAttribute('fill', 'white');
                svg.appendChild(pixel2);
            }
        }
    }

    return svg;
}

var dict;

function generateArucoMarker(width, height, id) {
    var dictName = '4x4_1000'; // Definindo diretamente o dicionário como '4x4_1000'

    console.log('Generate ArUco marker ' + dictName + ' ' + id);

    var bytes = dict[dictName][id];
    var bits = [];
    var bitsCount = width * height;

    // Parse marker's bytes
    for (var byte of bytes) {
        var start = bitsCount - bits.length;
        for (var i = Math.min(7, start - 1); i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
    }

    return generateMarkerSvg(width, height, bits);
}

// Fetch markers dict
var loadDict = fetch('dict.json').then(function(res) {
    return res.json();
}).then(function(json) {
    dict = json;
});

function init() {
    function generateMarkerSvg(width, height, bits, fixPdfArtifacts = true) {
    var svg = document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 ' + (width + 2) + ' ' + (height + 2));
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('shape-rendering', 'crispEdges');

    // Background rect
    var rect = document.createElement('rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', width + 2);
    rect.setAttribute('height', height + 2);
    rect.setAttribute('fill', 'black');
    svg.appendChild(rect);

    // "Pixels"
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var white = bits[i * height + j];
            if (!white) continue;

            var pixel = document.createElement('rect');;
            pixel.setAttribute('width', 1);
            pixel.setAttribute('height', 1);
            pixel.setAttribute('x', j + 1);
            pixel.setAttribute('y', i + 1);
            pixel.setAttribute('fill', 'white');
            svg.appendChild(pixel);

            if (!fixPdfArtifacts) continue;

            if ((j < width - 1) && (bits[i * height + j + 1])) {
                pixel.setAttribute('width', 1.5);
            }

            if ((i < height - 1) && (bits[(i + 1) * height + j])) {
                var pixel2 = document.createElement('rect');;
                pixel2.setAttribute('width', 1);
                pixel2.setAttribute('height', 1.5);
                pixel2.setAttribute('x', j + 1);
                pixel2.setAttribute('y', i + 1);
                pixel2.setAttribute('fill', 'white');
                svg.appendChild(pixel2);
            }
        }
    }

    return svg;
}

var dict;

function generateArucoMarker(width, height, id) {
    var dictName = '4x4_1000'; // Definindo diretamente o dicionário como '4x4_1000'

    console.log('Generate ArUco marker ' + dictName + ' ' + id);

    var bytes = dict[dictName][id];
    var bits = [];
    var bitsCount = width * height;

    // Parse marker's bytes
    for (var byte of bytes) {
        var start = bitsCount - bits.length;
        for (var i = Math.min(7, start - 1); i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
    }

    return generateMarkerSvg(width, height, bits);
}

// Fetch markers dict
var loadDict = fetch('../JS/dict.json').then(function(res) {
    return res.json();
}).then(function(json) {
    dict = json;
});

function init() {
    var markerIdInput = document.querySelector('.setup select[name="id"]');
    var sizeInput = document.querySelector('.setup input[name=size]');
    var saveButton = document.querySelector('.save-button');

    function updateMarker() {
        var markerId = Number(markerIdInput.value);
        var size = Number(sizeInput.value);
        var width = 4; // largura específica para '4x4_1000'
        var height = 4; // altura específica para '4x4_1000'
        var maxId = 1000 - 1; // número máximo de IDs para '4x4_1000'

        markerIdInput.setAttribute('max', maxId);

        if (markerId > maxId) {
            markerIdInput.value = maxId;
            markerId = maxId;
        }

        // Wait until dict data is loaded
        loadDict.then(function() {
            // Generate marker
            var svg = generateArucoMarker(width, height, markerId, size);
            svg.setAttribute('width', size + 'mm');
            svg.setAttribute('height', size + 'mm');
            document.querySelector('.marker').innerHTML = svg.outerHTML;
            saveButton.setAttribute('href', 'data:image/svg;base64,' + btoa(svg.outerHTML.replace('viewbox', 'viewBox')));
            saveButton.setAttribute('download', '4x4_1000-' + markerId + '.svg');
            document.querySelector('.marker-id').innerHTML = 'ID ' + markerId;
        })
    }

    updateMarker();

    markerIdInput.addEventListener('input', updateMarker);
    sizeInput.addEventListener('input', updateMarker);
}

init();
var markerIdInput =  document.querySelector('.aruco_maker').getAttribute('aruco_id');
var sizeInput = document.getElementById('frm-size');
var saveButton = document.querySelector('.save-button');

    function updateMarker() {
        var markerId = Number(markerIdInput.value);
        var size = Number(sizeInput.value);
        var width = 4; // largura específica para '4x4_1000'
        var height = 4; // altura específica para '4x4_1000'
        var maxId = 1000 - 1; // número máximo de IDs para '4x4_1000'

        markerIdInput.setAttribute('max', maxId);

        if (markerId > maxId) {
            markerIdInput.value = maxId;
            markerId = maxId;
        }

        // Wait until dict data is loaded
        loadDict.then(function() {
            // Generate marker
            var svg = generateArucoMarker(width, height, markerId, size);
            svg.setAttribute('width', size + 'mm');
            svg.setAttribute('height', size + 'mm');
            document.querySelector('.marker').innerHTML = svg.outerHTML;
            saveButton.setAttribute('href', 'data:image/svg;base64,' + btoa(svg.outerHTML.replace('viewbox', 'viewBox')));
            saveButton.setAttribute('download', '4x4_1000-' + markerId + '.svg');
            document.querySelector('.marker-id').innerHTML = 'ID ' + markerId;
        })
    }

    updateMarker();

    markerIdInput.addEventListener('input', updateMarker);
    sizeInput.addEventListener('input', updateMarker);
}

init();
