var compy = (() => {

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
    func: f => `"(${f.toString()})()"`
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
