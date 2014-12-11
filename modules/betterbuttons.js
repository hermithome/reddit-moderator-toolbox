function betterbuttons() {

var buttons = new TB.Module('Better Buttons');
buttons.shortname = "BButtons";

//Default settings
buttons.settings["enabled"]["default"] = false;

buttons.register_setting("enablemodsave", {
    "type": "boolean",
    "default": true,
    "betamode": false,
    "hidden": false,
    "title": "Enable mod-save button"
});
buttons.register_setting("enabledistinguishtoggle", {
    "type": "boolean",
    "default": true,
    "betamode": false,
    "hidden": false,
    "title": "Enable distinguish toggling"
});

buttons.initModSave = function initModSave() {
    buttons.log("Adding mod save buttons");

    //Watches for changes in the DOM
    var commentObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes) {
                for (var i = 0; i < mutation.addedNodes.length; ++i) {
                    var item = mutation.addedNodes[i];
                    //Check if the added element is a comment
                    if ($(item).is('div.comment')) {
                        buttons.log($(item));
                        buttons.log("");

                        //Distinguish the comment
                        var things = $(item).find('form[action="/post/distinguish"] > .option > a');
                        buttons.log(things);
                        buttons.log("");
                        buttons.log(things.first());
                        things.first().click();

                        //Stop watching for changes
                        commentObserver.disconnect();
                        return;
                    }
                }
            }
        });
    });

    //Add the mod save button next to each comment save button
    var saveButton = $('body.moderator button.save');
    if (saveButton.css("display") != "none")
        saveButton.after('<button class="save-mod">mod save</button>');

    //Add actions to the mod save buttons
    $('body').on('click', 'button.save-mod', function (e) {
        buttons.log("Mod save clicked!");
        commentObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
        $(this).parent().find('button.save').click();
    });
};

buttons.initDistinguishToggle = function initDistinguishToggle() {
    //Get a comment's distinguish state
    function getDistinguishState(post) {
        var author = $(post).find('a.author').first();
        return author.hasClass('moderator');
    }

    //Toggle the distinguished state
    function distinguishClicked() {
        parentPost = $(this).parents('.thing').first();
        var distinguished = getDistinguishState(parentPost);

        $(this).find('.option > a').get(distinguished ? 1 : 0).click();
    }

    buttons.log("Adding distinguish toggle events");

    //Add distinguish button listeners
    $('.thing .buttons').on('click', 'form[action="/post/distinguish"]', distinguishClicked);

    //Watches for changes in DOM to add distinguish button listeners if needed
    var commentObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes) {
                for (var i = 0; i < mutation.addedNodes.length; ++i) {
                    var item = mutation.addedNodes[i];
                    //Check if the added element is a comment
                    if ($(item).is('div.comment')) {
                        $(item).find('form[action="/post/distinguish"]').first().on('click', distinguishClicked);
                        return;
                    }
                }
            }
        });
    });
    commentObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });
};

buttons.init = function betterButtonInit() {
    if (this.setting('enablemodsave'))
        buttons.initModSave();

    if (this.setting('enabledistinguishtoggle'))
        buttons.initDistinguishToggle();
};

TB.register_module(buttons);
}

(function() {
    window.addEventListener("TBObjectLoaded", function () {
        betterbuttons();
    });
})();
