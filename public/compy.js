'use strict';

// give all components id
// create state object

var getJSON = function getJSON(url, callback) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) callback(JSON.parse(request.responseText));
    }
  };
  request.open('GET', url);
  request.send();
};
var loadRemoteComponent = function loadRemoteComponent(url, id) {
  getJSON(url, function (data) {
    document.getElementById(id).innerHTML = compy.renderComponent("blogPost", data.blogPost);
  });
};
var createId = function (id) {
  return function () {
    return id++;
  };
}(0);

var compy = function () {

  var components = Object.create(null);

  var createWrapper = function createWrapper(id) {
    var wrapper = document.createElement('div');
    wrapper.setAttribute("id", id);
    document.getElementById('compy').appendChild(wrapper);
    return wrapper;
  };

  var defineComponent = function defineComponent(renderers) {
    return function (data, children) {
      console.log("rendering ", data);
      var className = typeof data.className === "undefined" ? '' : data.className;
      if (data.editStatus === "editing") {
        return '\n        <div class="compyDiv ' + className + '">\n          ' + renderers.renderEdit(data, children) + '\n        </div>\n        ';
      } else if (data.editStatus === "editable") {
        return '\n        <div class="compyDiv ' + className + '">\n          ' + renderers.renderConst(data, children) + '\n          ' + renderers.renderEditOptions(data, children) + '\n        </div>\n        ';
      } else if (data.editStatus === "none") {
        return '\n        <div class="compyDiv ' + className + '">\n          ' + renderers.renderConst(data, children) + '\n        </div>\n      ';
      }
    };
  };

  return {
    components: components,
    defineComponent: defineComponent
  };
}();

var header = function header() {
  return compyArray(data.header, [title, linkArray]);
};

var getIcon = function getIcon(actionName) {
  var icon;
  if (actionName === "edit") {
    icon = 'glyphicon-pencil';
  } else if (actionName === "add") {
    icon = 'glyphicon-plus';
  } else if (actionName === "save") {
    icon = 'glyphicon-ok';
  }
  return '\n    <span class="button glyphicon ' + icon + '" aria-hidden="true"></span>\n  ';
};

var actionButton = function actionButton(actionName, text, id) {
  return '\n    <span onClick="(function(e) {\n      actions.' + actionName + '(' + id + ', e.target.parentNode)\n    })(event)">\n      ' + getIcon(text) + '\n    </span>\n  ';
};

var textField = compy.defineComponent({
  renderConst: function renderConst(data) {
    return '\n    <span>\n      ' + data.text + '\n    </span>\n  ';
  },
  renderEditOptions: function renderEditOptions(data) {
    return actionButton("edit", "edit", data.id);
  },
  renderEdit: function renderEdit(data) {
    return '\n    <div>\n      <input type="text" value="' + data.text + '"></input>\n      ' + actionButton("save", "save", data.id, "text") + '\n    </div>\n  ';
  }
});

var link = compy.defineComponent({
  renderConst: function renderConst(data) {
    return '\n    <a href="' + data.url + '">\n      ' + data.text + '\n    </a>\n  ';
  },
  renderEditOptions: function renderEditOptions(data) {
    return actionButton("edit", "edit", data.id);
  },
  renderEdit: function renderEdit(data) {
    return '\n    <span>text:</span>\n    <input type="text" value="' + data.text + '"></input>\n    <span>url:</span>\n    <input type="text" value="' + data.url + '"></input>\n    ' + actionButton("saveUrl", "save", data.id) + '\n  ';
  }
});
var compyArray = compy.defineComponent({
  renderConst: function renderConst(renderData, children) {
    return renderData.elems.map(function (element, i) {
      return children[i](data[element]);
    }).join('');
  },
  renderEditOptions: function renderEditOptions(renderData) {
    return actionButton("editArray", "edit", renderData.id);
  },
  renderEdit: function renderEdit(renderData, children) {
    return '\n    ' + renderData.elems.map(function (element, i) {
      return children[i](data[element]);
    }).join('') + '\n    ' + actionButton("saveArray", "save", renderData.id) + '\n    ' + actionButton("addElement", "add", renderData.id) + '\n  ';
  }
});
var hemoArray = function hemoArray(renderData, child) {
  var children = [];
  var i;
  for (i = 0; i < renderData.elems.length; i++) {
    children.push(child);
  }return compyArray(renderData, children);
};
var linkArray = function linkArray(renderData) {
  return hemoArray(renderData, link);
};

var blogPost = function blogPost(renderData) {
  return compyArray(renderData, [title, textField]);
};

var getData = function getData(id) {
  return data[Object.keys(data).filter(function (key) {
    return data[key].id === id;
  })];
};

var data = {
  blog1: {
    className: "blog",
    editStatus: "editable",
    id: createId(),
    elems: ["blog1Title", "blog1Text"]
  },
  blog1Title: {
    text: "hello world",
    id: createId(),
    editStatus: "none"
  },
  blog1Text: {
    editStatus: "none",
    className: "blogText",
    text: "change me!",
    id: createId()
  },
  header: {
    className: "header",
    id: createId(),
    editStatus: "editable",
    elems: ["title", 'links']
  },
  title: {
    id: createId(),
    text: "change me",
    editStatus: "none"
  },
  githubLink: {
    id: createId(),
    "url": "http://github.com/des-des",
    "text": "github",
    editStatus: "none"
  },
  twitterLink: {
    id: createId(),
    "url": "https://twitter.com/desmond_eoin",
    "text": "twitter",
    editStatus: "none"
  },
  links: {
    id: createId(),
    elems: ["twitterLink", "githubLink"],
    editStatus: "none"
  }
};

var actions = {
  edit: function edit(id) {
    getData(id).editStatus = "editing";
    renderPage();
  },
  editArray: function editArray(id) {
    getData(id).editStatus = "editing";
    getData(id).elems.forEach(function (elem) {
      return data[elem].editStatus = "editable";
    });
    renderPage();
  },
  save: function save(id, component) {
    var componentData = getData(id);
    var newData = component.parentNode.getElementsByTagName('input')[0].value;
    // console.log(value);
    componentData.text = newData;
    componentData.editStatus = "editable";
    renderPage();
  },
  saveUrl: function saveUrl(id, component) {
    var componentData = getData(id);
    var inputs = [].map.call(component.parentNode.getElementsByTagName('input'), function (input) {
      return input.value;
    });
    componentData.text = inputs[0];
    componentData.url = inputs[1];
    componentData.editStatus = "editable";
    renderPage();
  },
  saveArray: function saveArray(id, component, newEditStatus) {
    var componentData = getData(id);
    componentData.elems.forEach(function (elem) {
      data[elem].editStatus = 'none';
      console.log(data[elem]);
      if (typeof data[elem].elems !== "undefined") {
        actions.saveArray(data[elem].id, null, "none");
      }
    });
    componentData.editStatus = newEditStatus || 'editable';
    renderPage();
  }
};

var title = function title(renderData) {
  return '\n  <h2>\n    ' + textField(renderData) + '\n  </h2>';
};

var renderPage = function renderPage() {
  var html = header() + blogPost(data.blog1);
  document.getElementById('compy').innerHTML = html;
};

renderPage();