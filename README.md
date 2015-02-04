# マルチデバイスの教科書 11章サンプル

## はじめに

Bowerのコンポーネント（Bootstrap for Sass など）と、gulpで使用するnode moduleをインストール

``` bash
$ bower install
$ npm install
```

## gulpでのwatchを開始

以下のコマンドで、プロジェクトフォルダ内のjadeファイルやscssファイル、アイコンフォント用のsvgファイルなどの変更を監視します。

Browser syncによって自動でローカルサーバーが起動し、ブラウザにページが表示されます。変更監視によって、ファイルに変更があった際は自動でリロードされます。

``` bash
$ gulp watch
```

 or

``` bash
$ gulp w
```

## jadeを編集してHTMLを作る

上記の監視状態で、[devディレクトリにあるjadeファイル](dev/jade) を編集すると、自動でHTMLが生成されます。

「index.jade」を編集すると、「index.html」がdevディレクトリ直下に生成されます。  
HTMLの共通部分（head要素など）は「_layout.jade」でテンプレートしてあります。

なお、「_」ではじまるファイル名のjadeファイルはHTMLを生成しません。

``` bash
dev
└── jade
    ├── _include
    │   └── _layout.jade
    └── index.jade
```

## SCSSを編集してCSSを作る

監視状態で、[devディレクトリにあるscssファイル](dev/scss) を編集すると、自動でCSSが生成されます。

scssファイルを編集すると、「dev/css/style.css」として生成されます。  
Bootstrapの各種変数は「_bootstrap-variables.sass」を編集してください。

なお、「_」ではじまるファイル名のscssファイルはCSSを生成しません。

``` bash
dev
└── scss
    ├── _bootstrap-variables.sass
    ├── _bootstrap.scss
    ├── _icons.scss
    └── style.scss
```

## アイコンフォントを作る

監視状態で、[dev/icons](dev/icons) の中にアイコンとなるsvgファイルを追加すると、[dev/fonts](dev/fonts) の中に自動的にアイコンフォントファイルが生成されます。  
アイコンフォントを使用する際のスタイルとして、scssディレクトリに「_icons.scss」も併せて生成されます。

デフォルトでは「myicons.woff」といったフォントファイル名になりますが、[gulpfile.js](gulpfile.js)の「iconfonts」タスクの「fontName」の値で変更できます。

``` js
gulp.task('iconfonts', function(){
  return gulp.src(['dev/icons/*.svg'])
    .pipe(iconfontCss({
      fontName: 'myicons',
      path: 'dev/icons/templates/_icons.scss',
      ...
    }))
    .pipe(gulp.dest('dev/fonts'));
});
```

## Bowerコンポーネントを追加してみる

監視状態で、Bowerコンポーネントを追加すると、jsファイルであればjadeファイル（_layout.jade）に、scssファイルであればscssファイル（style.scss）に自動的にパスが追加されます。

ターミナルを別ウインドウで起動し、試しに、アニメーションの実装でよく使用される「[Velocity.js](https://github.com/julianshapiro/velocity)」を追加してみましょう。

``` bash
$ bower install velocity --save
```

--save オプションを付けることで、「bower.json」にVelocity.jsが追加されます。  
bower.jsonが変更されたことで自動的に_layout.jadeにjsファイルへのパスが追加されていることが分かります。

``` jade
    // bower:js
    script(src='../bower_components/jquery/dist/jquery.js')
    script(src='../bower_components/velocity/velocity.js')
    script(src='../bower_components/velocity/velocity.ui.js')
    // endbower
```

なお、コンポーネントをアンインストールする際は以下のコマンドを実行します。

``` bash
$ bower uninstall velocity --save
```


## 公開用ファイルセットをビルドする

HTMLやCSSの編集が完了したら、公開用のファイルセットを生成します。

開発用のdevディレクトリの中には公開時には必要のないファイルも含まれており、cssファイルやjsファイルも結合・Minifyされていませんので、これらを公開用に最適化します。

``` bash
$ gulp build
```

上記のコマンドを実装することで、「htdocs」ディレクトリが新たに作られ、その中に必要なファイルのみが生成されます。

buildタスクでは以下の処理を行っています。

- jadeのコンパイル
- scssのコンパイル
- jsファイルの結合・Minify
- cssファイルから未使用のセレクターを削除
- cssファイル内の、同じ@media規則を統合
- cssファイルのMinify
- 画像の最適化
- アイコンフォントファイルのコピー

buildタスクの処理が完了すると、htdocsディレクトリの中は以下の様な構成で生成されています。

``` bash
htdocs
├── css
│   └── style.css
├── fonts
│   ├── glyphicons-halflings-regular.eot
│   ├── glyphicons-halflings-regular.svg
│   ├── glyphicons-halflings-regular.ttf
│   ├── glyphicons-halflings-regular.woff
│   ├── myicons.eot
│   ├── myicons.svg
│   ├── myicons.ttf
│   └── myicons.woff
├── index.html
└── js
    ├── lib.js
    ├── main.js
    ├── modernizr.js
    └── respond.js
```

jQueryやBootstrapのjsファイルは「lib.js」として結合されていますし、アイコンフォント用のsvgファイルの置き場所である「icons」フォルダは不要なため削除されていることが分かります。

