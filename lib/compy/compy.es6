// give all components id
// create state object

var getJSON = function(url, callback) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = () => {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) callback(JSON.parse(request.responseText));
    }
  }
  request.open('GET', url);
  request.send();
};
var loadRemoteComponent = (url, id) => {
  getJSON(url, data => {
    document.getElementById(id).innerHTML =
      compy.renderComponent("blogPost", data.blogPost);
  });
}
var createId = ((id) => () => id++)(0);

var compy = (() => {

  var components = Object.create(null);

  var createWrapper = id => {
    var wrapper = document.createElement('div');
    wrapper.setAttribute("id", id);
    document.getElementById('compy').appendChild(wrapper);
    return wrapper;
  }

  var defineComponent = renderers => (data, children) => {
    console.log("rendering ", data);
    var className = typeof data.className  === "undefined" ?
      `` : data.className;
    if (data.editStatus === "editing") {
      return `
        <div class="compyDiv ${className}">
          ${renderers.renderEdit(data, children)}
        </div>
        `;
    } else if (data.editStatus === "editable") {
      return `
        <div class="compyDiv ${className}">
          ${renderers.renderConst(data, children)}
          ${renderers.renderEditOptions(data, children)}
        </div>
        `;
    } else if (data.editStatus === "none") {
      return `
        <div class="compyDiv ${className}">
          ${renderers.renderConst(data, children)}
        </div>
      `;
    }
  }

  return {
    components,
    defineComponent
  }
})();


var header = () => compyArray(data.header, [
  title,
  linkArray
]);


var getIcon = actionName => {
  var icon;
  if (actionName === "edit") {
    icon = `glyphicon-pencil`;
  } else if (actionName === "add") {
    icon = `glyphicon-plus`;
  } else if (actionName === "save") {
    icon = `glyphicon-ok`;
  }
  return `
    <span class="button glyphicon ${icon}" aria-hidden="true"></span>
  `;
}

var actionButton = (actionName, text, id) => {
  return `
    <span onClick="(function(e) {
      actions.${actionName}(${id}, e.target.parentNode)
    })(event)">
      ${getIcon(text)}
    </span>
  `;
};

var textField = compy.defineComponent({
  renderConst: data => `
    <span>
      ${data.text}
    </span>
  `,
  renderEditOptions: data => actionButton("edit", "edit", data.id),
  renderEdit: data => `
    <div>
      <input type="text" value="${data.text}"></input>
      ${actionButton("save", "save", data.id, "text")}
    </div>
  `
});

var link = compy.defineComponent({
  renderConst: data => `
    <a href="${data.url}">
      ${data.text}
    </a>
  `,
  renderEditOptions: data => actionButton("edit", "edit", data.id),
  renderEdit: data => `
    <span>text:</span>
    <input type="text" value="${data.text}"></input>
    <span>url:</span>
    <input type="text" value="${data.url}"></input>
    ${actionButton("saveUrl", "save", data.id)}
  `
});
var compyArray = compy.defineComponent({
  renderConst: (renderData, children) => (
    renderData.elems.map((element, i) => children[i](data[element])).join('')
  ),
  renderEditOptions: renderData => (
    actionButton("editArray", "edit", renderData.id)
  ),
  renderEdit: (renderData, children) => `
    ${renderData.elems.map((element, i) => children[i](data[element])).join('')}
    ${actionButton("saveArray", "save", renderData.id)}
    ${actionButton("addElement", "add", renderData.id)}
  `
});
var hemoArray = (renderData, child) => {
  var children = [];
  var i;
  for (i = 0; i < renderData.elems.length; i++) children.push(child);
  return compyArray(renderData, children);
};
var linkArray = renderData => hemoArray(renderData, link);

var blogPost = (renderData) => compyArray(renderData, [title, textField]);

var getData = id => data[Object.keys(data).filter(key => data[key].id === id)];

var data = {
  blog1: {
    className: "blog",
    editStatus : "editable",
    id: createId(),
    elems: ["blog1Title", "blog1Text"]
  },
  blog1Title: {
    text: "hello world",
    id: createId(),
    editStatus : "none",
  },
  blog1Text: {
    editStatus : "none",
    className: "blogText",
    text: "change me!",
    id: createId(),
  },
  header: {
    className: "header",
    id : createId(),
    editStatus : "editable",
    elems: ["title", 'links']
  },
  title: {
    id : createId(),
    text : "change me",
    editStatus : "none"
  },
  githubLink: {
    id:createId(),
    "url": "http://github.com/des-des",
    "text": "github",
    editStatus: "none"
  },
  twitterLink: {
    id:createId(),
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
  edit: id => {
    getData(id).editStatus = "editing";
    renderPage();
  },
  editArray: id => {
    getData(id).editStatus="editing";
    getData(id).elems.forEach(elem => (
      data[elem].editStatus = "editable"
    ));
    renderPage();
  },
  save: (id, component) => {
    var componentData = getData(id);
    var newData = component.parentNode.getElementsByTagName('input')[0].value;
    // console.log(value);
    componentData.text = newData;
    componentData.editStatus="editable";
    renderPage();
  },
  saveUrl: (id, component) => {
    var componentData = getData(id);
    var inputs = [].map.call(
      component.parentNode.getElementsByTagName('input'),
      input => input.value
    );
    componentData.text = inputs[0];
    componentData.url = inputs[1];
    componentData.editStatus="editable";
    renderPage();
  },
  saveArray: (id, component, newEditStatus) => {
    var componentData = getData(id);
    componentData.elems.forEach(elem => {
      data[elem].editStatus = 'none'
      console.log(data[elem]);
      if (typeof data[elem].elems !== "undefined") {
        actions.saveArray(data[elem].id, null, "none");
      }
    });
    componentData.editStatus = newEditStatus || 'editable'
    renderPage();
  }
};

var title = (renderData) => `
  <h2>
    ${textField(renderData)}
  </h2>`;

var renderPage = () => {
  var html = header() + blogPost(data.blog1);
  document.getElementById('compy').innerHTML = html;
};

renderPage();
