const vDrag = {
    mounted(el, binding) {
        const oDiv = el // 当前元素
        // const minTop = oDiv.getAttribute('drag-min-top')
        const minTop = 0
        const ifMoveSizeArea = 20
        const header = oDiv.getElementsByClassName('header')[0]
        header.onmousedown = e => {
            let target = oDiv
            // while (window.getComputedStyle(target).position !== 'absolute' && target !== document.body) {
            //     target = target.parentElement
            // }
            document.onselectstart = () => {
                return false
            }
            if (!target.getAttribute('init_x')) {
                target.setAttribute('init_x', target.offsetLeft)
                target.setAttribute('init_y', target.offsetTop)
            }
            const initX = parseInt(target.getAttribute('init_x'))
            const initY = parseInt(target.getAttribute('init_y'))
            // 鼠标按下，计算当前元素距离可视区的距离
            const disX = e.clientX - target.offsetLeft
            const disY = e.clientY - target.offsetTop
            document.onmousemove = e => {
                // 通过事件委托，计算移动的距离
                // 因为浏览器里并不能直接取到并且使用clientX、clientY,所以使用事件委托在内部做完赋值
                const l = e.clientX - disX
                const t = e.clientY - disY
                const { marginTop: mt, marginLeft: ml } = window.getComputedStyle(target)
                // 计算移动当前元素的位置，并且给该元素样式中的left和top值赋值
                target.style.left = l + 'px'
                target.style.top = (t < minTop ? minTop : t) + 'px'
                target.style.left = l - parseInt(ml) + 'px'
                target.style.top = (t < minTop ? minTop : t) - parseInt(mt) + 'px'
                if (Math.abs(l - initX) > ifMoveSizeArea || Math.abs(t - initY) > ifMoveSizeArea) {
                    target.setAttribute('dragged', '')
                } else {
                    target.removeAttribute('dragged')
                }
            }
            document.onmouseup = e => {
                document.onmousemove = null
                document.onmouseup = null
                document.onselectstart = null
            }
            // return false不加的话可能导致黏连，拖到一个地方时div粘在鼠标上不下来，相当于onmouseup失效
            return false
        }
    },
}

export { vDrag }
