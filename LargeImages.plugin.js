/**
 * @name LargeImages
 * @invite seymar
 * @authorLink https://github.com/seymar
 * @donate 
 * @patreon 
 * @website https://github.com/seymar/LargeImages
 * @source https://github.com/seymar/LargeImages
 */

var LargeImages = (() => {
    const config = {
        info: {
            name: 'LargeImages',
            authors:[
                { name: 'seymar' }
            ],
            version: '0.0.1',
            description: 'Show large full resolution images in chats',
            github: 'https://github.com/seymar/LargeImages',
            github_raw: 'https://raw.githubusercontent.com/seymar/LargeImages/master/LargeImages.plugin.js'
        },
        changelog: [
            { title: 'Initial version', items: ['Initial version']}
        ],
        defaultConfig: []
    }

    const LOG = (msg, ...a) => console.log(`[${config.info.name}] ${msg}`, ...a)

    return class {
        constructor () { this._config = config }
        getName () { return config.info.name }
        getAuthor () { return config.info.authors.map(a => a.name).join(", ") }
        getDescription () { return config.info.description }
        getVersion () { return config.info.version }
        
        load () {
            this.start()
        }
        
        start () {
            this.updateInterval = setInterval(() => {
                this.alterAllImages()
            }, 1000)
        }
        stop () {
            clearInterval(this.updateInterval)
        }

        alterAllImages () {
            [ ...document.querySelectorAll('a[class*=embedWrapper-]') ].forEach(e => {
                const img = e.querySelector('img')
                
                if (img) this.alterImage(img)
            })
        }

        alterImage (img) {
            // Make sure the containers have no limits
            img.parentNode.parentNode.style.justifySelf = 'stretch'
            img.parentNode.parentNode.style.maxWidth = 'none'
            img.parentNode.style.width = '100%'
            img.parentNode.style.height = ''
        
            // Stretch image itself
            img.style.position = 'relative'
            img.style.width = '100%'
            img.style.height = ''
            
            // Increase resolution by loading original image
            if (!img.parentNode) return false
            const newUrl = img.parentNode.getAttribute('href')

            if (img.src == newUrl) return false
            
            LOG('Image enlarged from/to: ' + (img.src.length - newUrl.length), img.src, newUrl)
            img.src = newUrl
        }
    }
})()