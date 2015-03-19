tagla
-----
Awesome Photo Tagging library


## Installation

```
bower install tagla
```

## Usage

* CSS files

```html
<link rel="stylesheet" href="bower_component/chosen_v1.3.0/chosen.min.css" />
<link rel="stylesheet" href="bower_component/tagla/dist/tagla.min.css" />
```

* JavaScript files

```html
<script src="bower_component/vendor/jquery/dist/jquery.min.js"></script>
<script src="bower_component/vendor/mustache.js/mustache.min.js"></script>
<!-- Draggabilly and Chosen are required for `editor: true` (start) -->
<script src="bower_component/vendor/draggabilly/dist/draggabilly.pkgd.min.js"></script>
<script src="bower_component/chosen_v1.3.0/chosen.jquery.min.js"></script>
<!-- Draggabilly and Chosen are required for `editor: true` (end) -->
<script src="bower_component/tagla/dist/tagla.min.js"></script>
```

* Instantiate

```js
var tagla = new Stackla.Tagla($container, {
  editor: true,
  unit: 'percent',
  data: [
    {
      x: 25,
      y: 70,
      label: 'frankie Magazine January 2015',
      price: '$26.95',
      description: 'Just try wiping ...',
      image: 'product.png'
    },
    {
      x: 33,
      y: 53,
      label: 'John Jr',
      price: 500,
      description: 'Shy...',
      image: 'product.png'
    },
    {
      x: 65,
      y: 32,
      label: 'Gobbler',
      price: 500,
      description: 'Eat everything',
      image: 'product.png'
    }
  ],
  unit: 'percent'
});
tagla.render();
```

## Development

* Install npm and bower packages for first time only.

```
$ git clone git@github.com:josephj/tagla.git
$ cd tagla
$ bower install .
$ npm install .
```

* Execute gulp

```
$ gulp
```
