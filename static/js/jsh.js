const h = (tagName="div", attributes={}, ...children) => {
    const element = document.createElement(tagName)

    for(const [key, value] of Object.entries(attributes)) {
        if(key.startsWith("on")) {
            element.addEventListener(key.substring(2).toLowerCase(), value)
        } else if (key == "className") {
            element.className = value
        } else {
            element.setAttribute(key, value)
        }
    }

    for(const child of children) {
        element.appendChild(
            typeof child == "string"
                ? document.createTextNode(child)
                : child
        )
    }

    return element
}

const $ = (initial, selector) => {
    return typeof initial == "string" && !selector 
        ? document.querySelector(initial)
        : initial.querySelector(selector)
}