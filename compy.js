var fs = require('fs');

var renderers = {
  header: headerData => `
    <div class='header'>
      ${render(headerData.components)}
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

var createPage = (data, title, style) => `
<!DOCTYPE html>
<head>
  <title> ${title} </title>
  <style>
    ${style}
  </style>
</head>
<body>
  ${render(data)}
<body>
`

var render = data => (
  Object.keys(data).map(key => renderComponent(key, data[key])).join('')
);

var renderComponent = (name, data) => data.style ? `
  <div style="${data.style}">
    ${renderers[name](data)}
  </div>` : renderers[name](data);


var pageData = {
  header: {
    components: {
      title: {
        text: 'hello, world',
      },
      linkList: [
        {
          url: 'http://github.com/des-des',
          text: 'github'
        },
        {
          url: 'https://twitter.com/desmond_eoin',
          text: 'twitter'
        }
      ]
    }
  },
  button: {
    onClick: () => console.log('hello world'),
    text: 'hey'
  }
}

var style = `
  a {
    text-decoration: none;
  }
`

var page = createPage(pageData, 'Eoin', style);
console.log(page);
fs.writeFileSync('page.html', page);
