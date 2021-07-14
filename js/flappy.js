function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// const b = new barreira (true)
// b.setAltura(200)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function parDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new barreira(true)
    this.inferior = new barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAltura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAltura()
    this.setX(x)
}

// const b = new parDeBarreiras(500, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento) 

function Barreiras(altura, largura, abertura, espaco, pontuar) {
    this.pares = [
        new parDeBarreiras(altura, abertura, largura),
        new parDeBarreiras(altura, abertura, largura + espaco),
        new parDeBarreiras(altura, abertura, largura + espaco * 2),
        new parDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAltura()
            }

            const meio = largura / 2
            const cruzou = par.getX() + deslocamento >= meio
                && par.getX() < meio

            cruzou && pontuar()
        })
    }
}



function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const newY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(newY)
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizaPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizaPontos(0)
}

function passou(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const naHorizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const naVertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return naVertical && naHorizontal
}

function bateu(passaro, barreiras) {
    let bateu = false

    barreiras.pares.forEach(parDeBarreiras => {
        if (!bateu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento

            bateu = passou(passaro.elemento, superior)
                || passou(passaro.elemento, inferior)
        }
    })
    return bateu
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[flappyArea]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const passaro = new Passaro(altura)
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizaPontos(++pontos))

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(bateu(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }

}

new FlappyBird().start()