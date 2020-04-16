/**
 * @name LargeImages
 * @invite seymar
 * @authorLink 
 * @donate 
 * @patreon 
 * @website 
 * @source 
 */
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

var LargeImages = (() => {
    const config = {
        info: {
            name: "LargeImages",
            authors:[
                { name:"seymar" }
            ],
            version: "0.0.1",
            description: "Show large full resolution images in chats",
            github: "",
            github_raw: ""
        },
        changelog: [
            {title: "Initial version", items: ["Initial version"]}
        ],
        defaultConfig:[
        ],
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
            let ignoreList = []
            this.unobserveMessages()
            this.messageObserver = new MutationObserver(mutations => {
                this.alterAllImages()

                // Change based altering wasn't reliable for some reason
                /*mutations.forEach(mutation => {
                    console.log(mutation.type, ignoreList.length)
                    const elements = [...mutation.addedNodes, mutation.target]
                    .filter(e => e.nodeName.toLowerCase() == 'img') // Only img
                    .forEach(e => {
                        // Check whether the message is currently being altered
                        // if so, temporarily ignore changes to prevent
                        // recursive mutations
                        if (ignoreList.includes(e)) return false
                        ignoreList.push(e)

                        this.alterImage(e)

                        // Stop ignoring changes of the message
                        ignoreList.splice(ignoreList.indexOf(e), 1)
                    })
                })*/
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
