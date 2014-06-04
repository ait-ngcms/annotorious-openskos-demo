window.queryEuropeana = function(collection, query) {
  console.log(collection);
  console.log(query);
  
  var list = $("<ul><li class=\"spinner\"><img src=\"annotorious-openskos-demo/ajax-loader.gif\"></li></ul>");
  $("#resultContainer").html(list);
  
  $.ajax({
    url: "http://europeana.eu/api/v2/search.json",
    jsonp: "callback",
    dataType: "jsonp",
    data: {
      wskey: "DeVWRDmwJ",
      query: "\"" + query + "\" AND europeana_collectionName:" + collection + " AND provider_aggregation_edm_isShownBy:*",
      qf: "TYPE:IMAGE",
      rows: 20
    },
    success: function( jsonResponse ) {
      list.html("");
      if (jsonResponse.items) {
        for (var i = 0; i < jsonResponse.items.length; i++) {
          console.log(jsonResponse.items[i].id);
          list.append("<li data-id=\"" + jsonResponse.items[i].id + "\">" +
              "<span class=\"link\"><img src=\"annotorious-openskos-demo/ajax-loader.gif\"></span>" +
              "<span class=\"title\">" + jsonResponse.items[i].title[0] + "</span>" +
              "<span class=\"dataProvider\">" + jsonResponse.items[i].dataProvider[0] + "</span></li>");
              
          $.ajax({
            url: "http://europeana.eu/api/v2/record" + jsonResponse.items[i].id + ".json",
            jsonp: "callback",
            dataType: "jsonp",
            data: {
              wskey: "DeVWRDmwJ",
            },
            success: function( jsonResponse2 ) {
              console.log(jsonResponse2.object.aggregations[0].edmIsShownBy);
              $('*[data-id="' + jsonResponse2.object.about + '"] .link').html("<a href=\"annotation.html?img=" +
                  encodeURIComponent(jsonResponse2.object.aggregations[0].edmIsShownBy) + "\"><span class=\"icon\">&#xf02c;</span> Annotate this Image</a>");
            }
          });
        }
      } else {
        list.append("<ul><li>no results found</li></ul>");
      }
    }
  });
};
