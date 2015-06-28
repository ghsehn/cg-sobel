;(function(window) {
    'use strict'

    var f = window.Filtros = window.Filtros || {}
    f.util = f.util || {}

    // Método original: http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
    // Licença Apache v2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    f.util.convolucao = function(pixels, weights) {
        if (!window.Float32Array)
            Float32Array = Array;

        var side = Math.round(Math.sqrt(weights.length))
        var halfSide = Math.floor(side / 2)

        var src = pixels.data
        var sw = pixels.width
        var sh = pixels.height

        var w = sw
        var h = sh
        var output = { width: w, height: h, data: new Float32Array(w * h * 4) }
        var dst = output.data

        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var sy = y
                var sx = x
                var dstOff = (y * w + x) * 4
                var r = 0, g = 0, b = 0, a = 0

                for (var cy = 0; cy < side; cy++) {
                    for (var cx = 0; cx < side; cx++) {
                        var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide))
                        var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide))
                        var srcOff = (scy * sw + scx) * 4
                        var wt = weights[cy * side + cx]
                        r += src[srcOff] * wt
                        g += src[srcOff + 1] * wt
                        b += src[srcOff + 2] * wt
                        a += src[srcOff + 3] * wt
                    }
                }

                dst[dstOff] = r
                dst[dstOff + 1] = g
                dst[dstOff + 2] = b
                dst[dstOff + 3] = 255
            }
        }

        return output
    }

    // Transforma imagem em escala de cinza
    f.escalaCinza = function(pixels) {
        var d = pixels.data

        for (var i = 0; i < d.length; i += 4) {
            var r = d[i]
            var g = d[i + 1]
            var b = d[i + 2]
            var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            d[i] = d[i + 1] = d[i + 2] = v
        }

        return pixels
    }

    // Limiarização da imagem (funciona apenas para escala de cinza)
    // Torna pixels da imagem brancos se valor > limiarT, caso contrário preto
    f.limiarizacao = function(pixels, limiarT) {
        var img = f.util.criarImageData(pixels.width, pixels.height)

        for (var i = 0; i < img.data.length; i += 4) {
            img.data[i] = img.data[i + 1] = img.data[i + 2] = (pixels.data[i] > limiarT) ? 255 : 0
            img.data[i + 3] = 255
        }

        return img
    }

    // Aplica filtro Sobel
    // Modos disponíveis:
    //   h: sobel horizontal
    //   v: sobel vertical
    //   m: sobel completo
    //  m2: sobel completo colorido (diferentes cores para horizontal e vertical)
    f.sobel = function(pixels, modo) {
        var matrizHorizontal =
            [-1, -2, -1,
              0,  0,  0,
              1,  2,  1]

        var matrizVertical =
            [-1,  0,  1,
             -2,  0,  2,
             -1,  0,  1]

        var pixelsPB = f.escalaCinza(pixels)
        var horizontal = f.util.convolucao(pixelsPB, matrizHorizontal)
        var vertical = f.util.convolucao(pixelsPB, matrizVertical)
        var img = f.util.criarImageData(pixels.width, pixels.height)

        for (var i = 0; i < img.data.length; i += 4) {
            var v = Math.abs(vertical.data[i])
            var h = Math.abs(horizontal.data[i])

            if (modo == 'h') {
                img.data[i] = h
                img.data[i + 1] = h
                img.data[i + 2] = h
                img.data[i + 3] = 255
            } else if (modo == 'v') {
                img.data[i] = v
                img.data[i + 1] = v
                img.data[i + 2] = v
                img.data[i + 3] = 255
            } else if (modo == 'm') {
                var s = Math.sqrt(Math.pow(h, 2) + Math.pow(v, 2))
                img.data[i] = s
                img.data[i + 1] = s
                img.data[i + 2] = s
                img.data[i + 3] = 255
            } else if (modo == 'm2') {
                img.data[i] = v
                img.data[i + 1] = (h + v) / 4
                img.data[i + 2] = h
                img.data[i + 3] = 255
            }
        }

        return img
    }

    // Conta quantidade de pixels brancos (valor 255) na imagem
    f.util.contarPixelsBrancos = function(pixels) {
        var c = 0

        for (var i = 0; i < pixels.data.length; i += 4) {
            if (pixels.data[i] == 255 && pixels.data[i + 1] == 255 && pixels.data[i + 2] == 255) {
                c++
            }
        }

        return c
    }

    // Cria canvas vazio com largura e altura, e retorna objeto ImageData com valores
    // dos pixels
    f.util.criarImageData = function(w, h) {
        var canvas = document.createElement('canvas')
        var context = canvas.getContext('2d')
        return context.createImageData(w, h)
    }

    // Recupera pixels de uma imagem ou canvas
    f.util.getPixels = function(img) {
        var canvas

        if (img.getContext) {
            canvas = img
        } else {
            canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
        }
        
        var context = canvas.getContext('2d')
        context.drawImage(img, 0, 0)
        return context.getImageData(0, 0, img.width, img.height)
    }
})(window)