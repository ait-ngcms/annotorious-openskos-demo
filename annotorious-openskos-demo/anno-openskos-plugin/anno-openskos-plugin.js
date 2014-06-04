annotorious.plugin.OpenSKOS = function(opt_config_options) {
  console.log(opt_config_options.endpoint_url);
  this.endpoint_url = opt_config_options.endpoint_url; 
}

annotorious.plugin.OpenSKOS.prototype.onInitAnnotator = function(annotator) {
  
  var self = this;
  
  var openSkosData = function(request, response) {
    var xmlHttp = new XMLHttpRequest();
    // replace symbols with a space which are not suited for searching in combination with '*'
    var searchTerm = '(' + request.term.replace(/[-.(),]/g, ' ') + '*)';
    
    $.ajax({
      url: self.endpoint_url + "/api/find-concepts",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        q: "prefLabelText:" + searchTerm + " OR altLabelText:" + searchTerm,
        rows: 100,
        format: "jsonp"
      },
      success: function( jsonResponse ) {
        var docs = jsonResponse.response.docs;
        var limit = 30;
        var availableTags = [];
        console.log("number of results: " + docs.length);
        for (var i = 0; i < docs.length && availableTags.length < limit; i++) {
          buildChoiceObjects(docs[i], docs[i].prefLabel, availableTags, request.term, limit);
          if (docs[i].altLabel != null) {
            buildChoiceObjects(docs[i], docs[i].altLabel, availableTags, request.term, limit);
          }
        }
        response(availableTags);
      }
    });    
  }
  
  var buildChoiceObjects = function(doc, labelList, availableTags, term, limit) {
    for (var j = 0; j < labelList.length && availableTags.length < limit; j++) {
      if (labelList[j].toLowerCase().indexOf(term.toLowerCase()) == 0) {
          var prefLabelList = "";
            for (var k = 0; k < doc.prefLabel.length; k++) {
              if (k != 0) prefLabelList += "; ";
              prefLabelList += doc.prefLabel[k];
            }
        
        availableTags.push({
                label: labelList[j] + " <em>" + prefLabelList + "</em>",
                value: labelList[j],
                uri: doc.uri
            });
      }
    }
  }
  
  var highlightText = function(text, $node) {
    var searchText = $.trim(text).toLowerCase(), currentNode = $node.get(0).firstChild, matchIndex, newTextNode, newSpanNode;
        while ((matchIndex = currentNode.data.toLowerCase().indexOf(searchText)) >= 0) {
          newTextNode = currentNode.splitText(matchIndex);
            currentNode = newTextNode.splitText(searchText.length);
            newSpanNode = document.createElement("span");
            newSpanNode.className = "highlight";
            currentNode.parentNode.insertBefore(newSpanNode, currentNode);
            newSpanNode.appendChild(newTextNode);
    }
  }
  
  // HTML template for input & tag display
  var editorTemplate = 
    '<div class="openskos-editor-container">' +
    '  <input type="text" placeholder="Add Tag..." autocomplete="off">' +
    '  <ul></ul>' +
    '</div>';
  
  var createTagElement = function(tagList, tag, annotation) {
    var li = $('<li class="openskos-tag" title="' + tag.label + '">' + tag.value + '<a title="Remove Tag" class="openskos-tag-remove">x</a></li>');
    tagList.append(li);
    li.find('a').click(function() {      
      var toRemove = $.inArray(tag, annotation.tags);
      annotation.tags.splice(toRemove, 1);
      li.remove();
    });
  }
  
  // Adds a tag  
  var addTag = function(tag, annotation, tagList) {
    if (!annotation.tags)
      annotation.tags = [];    
      
    // Add tag to annotation
    annotation.tags.push(tag);
    
    // Add tag to <ul> element in UI
    createTagElement(tagList, tag, annotation);
  };
  
  // Editor extension
  annotator.editor.addField(function(annotation) {
    var editorExtension = $(editorTemplate),
        tagInput = editorExtension.find('input'),
        tagList = editorExtension.find('ul');
      
    tagInput.autocomplete({
        source: openSkosData,
        delay: 100,
      select: function (event, ui) {
        addTag(ui.item, annotator.editor.getAnnotation(), tagList);
            event.preventDefault();
            tagInput.val("");
      },
        change: function (event, ui) {  
        tagInput.val("");
      }
    }).data('ui-autocomplete')._renderItem = function(ul, item) {
      var a = $('<a>' + item.label + '</a>');
      highlightText(this.term, a);
      return $('<li></li>').append(a).appendTo(ul);
    };
    
    if (annotation && annotation.tags) {
      $.each(annotation.tags, function(idx, tag) {
        createTagElement(tagList, tag, annotation);
      });
    }
    
    return editorExtension[0];
  });
  
  var popupTemplate = 
    '<div class="openskos-popup-container">' +
    '  <ul></ul>' +
    '</div>';
  
  // Popup extension
  annotator.popup.addField(function(annotation) {
    
    var popupExtension = $(popupTemplate);
    if (annotation.tags) {
      $.each(annotation.tags, function(idx, tag) {
        popupExtension.append('<li class="openskos-tag">' + tag.value + '</li>');
      });
    }
    return popupExtension[0];
  });
  
}

