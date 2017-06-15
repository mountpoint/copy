(function(global, doc) {
    var
        closePopupAfterCopyCheckbox = El.$('#close-popup-after-copy'),
        closePopupAfterCopyText = El.$('#close-popup-after-copy-text'),
        snippetTextInput = El.$('#snippet-text'),
        addSnippet = El.$('#add-snippet'),
        snippetsListText = El.$('#snippets-list-text'),
        snippetsList = El.$('#snippets-list')
    ;

    chrome.storage.sync.get('copy', function(storage) {
        var snippets = storage.copy.snippets;
        for (var i = 0, snippetslen = snippets.length; i < snippetslen; ++i) {
            snippetsList.insertAdjacentHTML('beforeend', getSnippetTemplate(snippets[i]));
        }

        closePopupAfterCopyCheckbox.checked = storage.copy.closePopupAfterCopy;
    });

    closePopupAfterCopyCheckbox.addEventListener('click', function(e) {
        Ext.setValue({
            closePopupAfterCopy: this.checked
        });
    });

    doc.addEventListener('click', function(e) {
        var
            el = e.target,
            snippetBlock
        ;

        // edit a snippet
        if (el.classList.contains('edit-snippet')) {
            snippetBlock = el.parentNode.parentNode.querySelector('.snippet');
            snippetBlock.setAttribute('contenteditable', true);
            snippetBlock.focus();
            El.hide(el.parentNode.querySelector('.edit-snippet'));
            El.show(el.parentNode.querySelector('.save-snippet'), 'inline-block');
        }

        // save a snippet
        if (el.classList.contains('save-snippet')) {
            snippetBlock = el.parentNode.parentNode.querySelector('.snippet');

            chrome.storage.sync.get('copy', function(storage) {
                var
                    snippets = storage.copy.snippets,
                    snippetText = snippetBlock.textContent,
                    snippetId = snippetBlock.dataset.snippetId
                ;

                for (var i = 0, snippetslen = snippets.length; i < snippetslen; ++i) {
                    if (snippets[i].id == snippetId) {
                        snippets[i].text = snippetText;
                        break;
                    }
                }

                Ext.setValue({
                    snippets: snippets
                }, function() {
                    snippetBlock.setAttribute('contenteditable', false);
                    El.hide(el.parentNode.querySelector('.save-snippet'));
                    El.show(el.parentNode.querySelector('.edit-snippet'), 'inline-block');
                });
            });
        }

        // delete a snippet
        if (el.classList.contains('remove-snippet')) {
            chrome.storage.sync.get('copy', function(storage) {
                snippetBlock = el.parentNode.parentNode.querySelector('.snippet');

                var
                    snippets = storage.copy.snippets,
                    snippetId = snippetBlock.dataset.snippetId,
                    snippetBlockParent = snippetBlock.parentNode
                ;

                for (var i = 0, snippetslen = snippets.length; i < snippetslen; ++i) {
                    if (snippets[i].id == snippetId) {
                        snippets.splice(i, 1);
                        break;
                    }
                }

                Ext.setValue({
                    snippets: snippets
                }, function() {
                    snippetBlockParent.parentNode.removeChild(snippetBlockParent);
                });
            });
        }
    });

    addSnippet.addEventListener('click', function() {
        if (snippetTextInput.value) {
            chrome.storage.sync.get('copy', function(storage) {
                var newSnippet = {
                    id: Ext.uniqId(),
                    text: snippetTextInput.value
                };

                storage.copy.snippets.push(newSnippet);

                Ext.setValue({
                    snippets: storage.copy.snippets
                });

                snippetsList.insertAdjacentHTML('beforeend', getSnippetTemplate(newSnippet));

                snippetTextInput.value = '';
            });
        } else {
            snippetTextInput.focus();
        }
    }, false);

    /**
     * Populate translations
     */
    El.text(closePopupAfterCopyText, Ext.__('close_popup_after_copy_text'));
    snippetTextInput.placeholder = Ext.__('enter_snippet_text');
    El.text(addSnippet, Ext.__('add_snippet'));
    El.text(snippetsListText, Ext.__('snippets_list_text'));


    function getSnippetTemplate(snippet) {
        return  '<li class="list-group-item">' +
                    '<span class="snippet" data-snippet-id="' + snippet.id + '">' + snippet.text + '</span>' +
                    '<span class="actions">' +
                        '<i class="glyphicon glyphicon-pencil edit-snippet"></i>' +
                        '<i class="glyphicon glyphicon-floppy-save save-snippet"></i>' +
                        '<i class="glyphicon glyphicon-remove remove-snippet"></i>' +
                    '</span>' +
                '</li>'
        ;
    }
})(window, document);
