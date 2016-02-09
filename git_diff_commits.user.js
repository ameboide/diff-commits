// ==UserScript==
// @name        Git Diff Commits
// @namespace   ameboide
// @include     https://bitbucket.org/*
// @include     https://github.com/*
// @version     1
// @grant       none
// ==/UserScript==

var stuff = {
  bitbucket: {
    url: function(from, to){ return url + '.git/branches/compare/' + to + '..' + from + '?w=1&ts=2#diff' },
    button_class: 'aui-lozenge',
    link_selector: 'a[href*="/commits/"]'
  },
  github: {
    url: function(from, to){ return url + '/compare/' + from + '...' + to + '?w=1&ts=2' },
    button_class: 'counter',
    link_selector: '.commit-id'
  }
};
var site_stuff = stuff[document.location.href.match(/\/\/(\w+)/)[1]];

var from = null;
var url = document.location.href.replace(/(:\/(\/[^\/]+){3})(.+)/, '$1').replace('.git', '');

var style = document.createElement('style');
style.innerHTML = '.diff-from { background-color: green; }' +
  '.commit-list td.hash, .commit-list td.hash > div { width: 110px; }';
document.body.appendChild(style);

function setCommit(event){
  var button = event.target;
  var c = button.getAttribute('data-commit');
  if(!from){
    from = c;
    button.classList.add('diff-from');
    return;
  }
  if(c != from) window.open(site_stuff.url(from, c));
  from = null;
  document.querySelector('.diff-from').classList.remove('diff-from');
}

function addButtons(){
  var links = document.querySelectorAll(site_stuff.link_selector + ':not(.diff-parsed)');
  for(var link of links){
    link.classList.add('diff-parsed');
    var m = link.href.match(/commits?\/(\w{40})(\?|$)/);
    if(!m) continue;

    var button = document.createElement('span');
    button.textContent = 'D';
    button.className = site_stuff.button_class;
    button.setAttribute('data-commit', m[1]);
    button.addEventListener('click', setCommit);

    link.parentNode.insertBefore(button, link.nextElementSibling);
  }
}

setInterval(addButtons, 1000);
