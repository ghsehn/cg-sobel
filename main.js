;(function($, f) {
    'use strict'

    function gerarFiltros(img) {
        $('#resultado').show()

        var pixels = f.util.getPixels(img)
        var completo = f.sobel(pixels, 'm')
        var horizontal = f.sobel(pixels, 'h')
        var vertical = f.sobel(pixels, 'v')
        var colorido = f.sobel(pixels, 'm2')
        var lim = f.limiarizacao(completo, 150)
        var limX = f.limiarizacao(horizontal, 150)
        var limY = f.limiarizacao(vertical, 150)
        var contadorTotal = f.util.contarPixelsBrancos(lim)
        var contadorX = f.util.contarPixelsBrancos(limX)
        var contadorY = f.util.contarPixelsBrancos(limY)

        $('.item').css('width', img.width)

        $('#original .img').html(img)
        $('#horizontal .img').html(criarCanvas(horizontal, img.width, img.height))
        $('#vertical .img').html(criarCanvas(vertical, img.width, img.height))
        $('#completo .img').html(criarCanvas(completo, img.width, img.height))
        $('#colorido .img').html(criarCanvas(colorido, img.width, img.height))

        $('#lim .img').html(criarCanvas(lim, img.width, img.height))
        $('#lim .pixels').html(contadorTotal)
       
        $('#lim-x .img').html(criarCanvas(limX, img.width, img.height))
        $('#lim-x .pixels').html(contadorX)

        $('#lim-y .img').html(criarCanvas(limY, img.width, img.height))
        $('#lim-y .pixels').html(contadorY)

        $('.resultado-calculo').css('opacity', 0)

        if (contadorX > contadorY) {
            $('.resultado-calculo').text('A imagem possui mais pixels de bordas horizontais')
        } else if (contadorY > contadorX) {
            $('.resultado-calculo').text('A imagem possui mais pixels de bordas verticais')
        } else {
            $('.resultado-calculo').text('A imagem possui a mesma quantidade de pixels para bordas horizontais e verticais')
        }

        $('.resultado-calculo').animate({'opacity': 1}, 500)
    }

    function criarCanvas(data, w, h) {
        var $canvas = $('<canvas></canvas>')
        $canvas[0].width = w
        $canvas[0].height = h

        var context = $canvas[0].getContext('2d')
        context.putImageData(data, 0, 0)

        return $canvas
    }

    $(function() {
        $('#upload').change(function(e) {
            var reader = new FileReader()

            reader.onload = function(e) {
                var img = new Image()

                img.onload = function() {
                    gerarFiltros(this)
                }

                img.onerror = function() {
                    $('#upload').val('')
                    alert('Imagem inválida ou corrompida')
                }

                img.src = e.target.result
            }

            reader.readAsDataURL(e.target.files[0])
        })
    })
})(jQuery, Filtros)