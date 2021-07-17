function newElement(tagName, className) {
    const newElement = document.createElement(tagName)
    newElement.className = className
    return newElement
}

function pipe(reversa = false) {
    this.element = newElement('div', 'pipe')

    const border = newElement('div', 'border')
    const body = newElement('div', 'body')

    this.element.appendChild(reversa ? body : border)
    this.element.appendChild(reversa ? border : body)

    this.setHeight = height => body.style.height = `${height}px`
}


function pairOfPipes(height, open, x) {
    this.element = newElement('div', 'pair-of-pipes')

    this.upper = new pipe(true)
    this.bottom = new pipe(false)

    this.element.appendChild(this.upper.element)
    this.element.appendChild(this.bottom.element)

    this.randomHeight = () => {
        const upperPipe = Math.random() * (height - open)
        const bottomPipe = height - open - upperPipe
        this.upper.setHeight(upperPipe)
        this.bottom.setHeight(bottomPipe)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.randomHeight()
    this.setX(x)
}

function setOfPipes(height, width, open, between, getPoint) {
    this.pairs = [
        new pairOfPipes(height, open, width),
        new pairOfPipes(height, open, width + between),
        new pairOfPipes(height, open, width + between * 2),
        new pairOfPipes(height, open, width + between * 3)
    ]

    const displacement = 3

    this.animation = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + between * this.pairs.length)
                pair.randomHeight()
            }

            const middle = width / 2
            const crossMiddle = pair.getX() + displacement >= middle
                && pair.getX() < middle

                crossMiddle && getPoint()
        })
    }
}

function Bird(gameHeight) {
    let fly = false

    this.element = newElement('img', 'bird')
    this.element.src = 'imgs/bird.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => fly = true
    window.onkeyup = e => fly = false

    this.animation = () => {
        const newY = this.getY() + (fly ? 8 : -5)
        const MaxHeight = gameHeight - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= MaxHeight) {
            this.setY(MaxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(gameHeight / 2)
}

function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

function crash(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const axisX = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const axisY = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return axisX && axisY
}

function colapsed(bird, setOfPipes) {
    let colapsed = false

    setOfPipes.pairs.forEach(pairOfPipes => {
        if (!colapsed) {
            const upper = pairOfPipes.upper.element
            const bottom = pairOfPipes.bottom.element

            colapsed = crash(bird.element, upper)
                || crash(bird.element, bottom)
        }
    })
    return colapsed
}

function FlappyBird() {
    let points = 0

    const GameArea = document.querySelector('[flappyArea]')
    const height = GameArea.clientHeight
    const width = GameArea.clientWidth

    const progress= new Progress()
    const bird = new Bird(height)
    const pipes = new setOfPipes(height, width, 200, 400, () => progress.updatePoints(++points))

    GameArea.appendChild(progress.element)
    GameArea.appendChild(bird.element)
    pipes.pairs.forEach(pair => GameArea.appendChild(pair.element))

    this.start = () => {
        const time = setInterval(() => {
            pipes.animation()
            bird.animation()

            if(colapsed(bird, pipes)) {
                clearInterval(time)
            }
        }, 20)
    }

}

new FlappyBird().start()