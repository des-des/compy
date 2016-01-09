if (typeof window !== "undefined") {
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
}

var compy = (() => {

  var createId = ((id) => () => id++)(0);

  var renderers = {
    header: headerData => `
      <div class='header'>
        ${renderComponentArray(headerData.components)}
      <div>
    `,
    linkList: links => links.map(link => `
      <a href='${link.url}'>${link.text}</a>
    `).join(''),
    title: title => `<h1> ${title.text} </h1>`,
    button: buttonData => `
      <button onClick=${renderers.func(buttonData.onClick)}>
        ${buttonData.text}
      </button>
    `,
    blogPost: blogPost => `
      <h3> ${blogPost.title} </h3>
      <p>  ${blogPost.text} </p>
    `,
    remoteComponent: remoteComponent => {
      var id = "remoteComponent" + createId();
      return `
      <div id="${id}">
      <script>
        window.onload = function() {
          loadRemoteComponent("${remoteComponent.url}", "${id}");
        };
      </script>
      </div>
      `;
    }
    // func: f => `"(${f.toString()})()"`
  };

  var createPage = (data) => {
    console.log(data);
    return `
  <!DOCTYPE html>
  <head>
    <title> ${data.title} </title>
    <style>
      ${data.style}
    </style>
  </head>
  <body>
    ${renderComponentArray(data.components)}
    <script src=compy.js></script>
  <body>
  `
  }

  var renderComponentArray = data => (
    Object.keys(data).map(key => renderComponent(key, data[key])).join('')
  );

  var renderComponent = (name, data) => data.style ? `
    <div style="${data.style}">
      ${renderers[name](data)}
    </div>` : renderers[name](data);

  return {
    renderComponent,
    renderComponentArray,
    createPage
  }
})();

if (typeof window === "undefined") {
  module.exports = compy
}
