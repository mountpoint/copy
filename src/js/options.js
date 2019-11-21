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
      snippetTextarea = el.parentNode.parentNode.parentNode.querySelector('textarea');

      chrome.storage.sync.get('copy', function(storage) {
        var
          snippets = storage.copy.snippets,
          snippetId = snippetBlock.dataset.snippetId
        ;

        for (var i = 0, snippetslen = snippets.length; i < snippetslen; ++i) {
          if (snippets[i].id == snippetId) {
            snippetTextarea.value = snippets[i].text;
            break;
          }
        }

        El.show(snippetTextarea);
        snippetTextarea.focus();

        El.hide(el.parentNode.querySelector('.edit-snippet'));
        El.hide(el.parentNode.querySelector('.remove-snippet'));
        El.show(el.parentNode.querySelector('.save-snippet'), 'inline-block');
        El.show(el.parentNode.querySelector('.cancel-snippet'), 'inline-block');
      });
    }

    // delete a snippet
    if (el.classList.contains('remove-snippet')) {
      if (confirm(Ext.__('confirm_delete_snippet_text'))) {
        chrome.storage.sync.get('copy', function(storage) {
          snippetBlock = el.parentNode.parentNode.querySelector('.snippet');

          var
            snippets = storage.copy.snippets,
            snippetId = snippetBlock.dataset.snippetId,
            snippetBlockParent = snippetBlock.parentNode.parentNode
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
    }

    // save a snippet
    if (el.classList.contains('save-snippet')) {
      snippetBlock = el.parentNode.parentNode.querySelector('.snippet');
      snippetTextarea = el.parentNode.parentNode.parentNode.querySelector('textarea');

      if (snippetTextarea.value) {
        chrome.storage.sync.get('copy', function(storage) {
          var
            snippets = storage.copy.snippets,
            snippetText = snippetTextarea.value,
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
            El.text(snippetBlock, Ext.shortText(snippetText, 150));

            El.hide(snippetTextarea);
            El.hide(el.parentNode.querySelector('.save-snippet'));
            El.hide(el.parentNode.querySelector('.cancel-snippet'));
            El.show(el.parentNode.querySelector('.edit-snippet'), 'inline-block');
            El.show(el.parentNode.querySelector('.remove-snippet'), 'inline-block');
          });
        });
      } else {
        snippetTextarea.focus();
      }
    }

    // cancel editing a snippet
    if (el.classList.contains('cancel-snippet')) {
      snippetTextarea = el.parentNode.parentNode.parentNode.querySelector('textarea');

      El.hide(snippetTextarea);
      El.hide(el.parentNode.querySelector('.save-snippet'));
      El.hide(el.parentNode.querySelector('.cancel-snippet'));
      El.show(el.parentNode.querySelector('.edit-snippet'), 'inline-block');
      El.show(el.parentNode.querySelector('.remove-snippet'), 'inline-block');
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
      return '<li class="list-group-item">' +
               '<div class="tbl">' +
                 '<span class="snippet" data-snippet-id="' + snippet.id + '">' + snippet.text + '</span>' +
                 '<span class="actions">' +
                   '<i class="glyphicon glyphicon-pencil edit-snippet"></i>' +
                   '<i class="glyphicon glyphicon-remove remove-snippet"></i>' +
                   '<i class="glyphicon glyphicon-floppy-save save-snippet"></i>' +
                   '<i class="glyphicon glyphicon-floppy-remove cancel-snippet"></i>' +
                 '</span>' +
               '</div>' +
               '<textarea class="form-control" rows="4"></textarea>' +
             '</li>'
      ;
    }
})(window, document);
