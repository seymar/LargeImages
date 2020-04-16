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
        defaultConfig: [],
        main:"index.js"
    }

    const LOG = (msg, ...a) => console.log(`[${config.info.name}] ${msg}`, ...a)

    return class {
        constructor () { this._config = config }
        getName () { return config.info.name }
        getAuthor () { return config.info.authors.map(a => a.name).join(", ") }
        getDescription () { return config.info.description }
        getVersion () { return config.info.version }
        load () {
            // Initialize for current chat
            const chat = document.querySelector('div[class*=da-chat]')
            // Detect switching betweens chats
            if (!chat) {
                // No chat to init, retry in a bit
                setTimeout(load, 1000)
                return false
            }

            this.initChat(chat)

            this.chatObserver = new MutationObserver(e => this.initChat(chat))
            .observe(chat, { attributes: true, childList: true })
        }

        initChat (chat) {
            LOG('initChat', chat.querySelector('main').getAttribute('aria-label'))
            
            this.unobserveMessages()
            this.alterAllImages()
            this.observeMessages()
        }

        unobserveMessages () {
            if (this.messageObserver) this.messageObserver.disconnect()
            LOG('Stopped observing messages')
        }

        observeMessages () {
            // Detect new messages and changes
            this.unobserveMessages()
            this.messageObserver = new MutationObserver(mutations => {
                clearTimeout(this.updateTimeout)
                this.updateTimeout = setTimeout(() => {
                    if (this.disableObserving) return false
                    this.disableObserving = true
                    this.alterAllImages()
                    this.disableObserving = false
                }, 25)
            })
            .observe(document.querySelector('div[data-ref-id=messages]'), {
                // Detect the addition of new messages or images in messages
                childList: true,
                subtree: true,
                // Detect image src changes
                attributes: true,
                attributeFilter: ['src']
            })
            LOG('Started observing messages')
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
            const newUrl = img.src
            .replace(/\?.*/, '') // Remove height/width parameters
            .replace(/(.*)http/g, 'http') // Extract original url
            .replace(/http\//, 'http://').replace(/https\//, 'https://') // Fix protocol

            if (img.src == newUrl) return false
            
            LOG('IMG src changes ' + (img.src.length - newUrl.length), img.src, newUrl)
            img.src = newUrl
        }

        alterAllImages () {
            [ ...document.querySelectorAll('a[class*=embedWrapper-]') ].forEach(e => {
                const img = e.querySelector('img')
                
                if (img) this.alterImage(img)
            })
        }

        // Unused methods
        start () {}
        stop () {
            this.unobserveMessages()
            this.chatObserver.disconnect()
        }
    }
})()