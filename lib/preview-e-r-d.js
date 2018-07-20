'use babel';

import url from 'url';
import t2erd from 't2erd';
import PreviewERDView from './preview-e-r-d-view';
import { CompositeDisposable } from 'atom';

export default {

  config: {
    'backgroundColour': {
      'title': 'Preview Window Background Colour',
      'type': 'string',
      'default': 'transparent',
      'order': 1
    }
  },

  previewERDView: null,
  // modalPanel: null,
  subscriptions: null,
  paneProtocol: 'erd-preview:',

  activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    const self = this;
    atom.workspace.addOpener((uri) => {
      const parsedUrl = url.parse(uri);
      if(!(parsedUrl.host === 'editor' && parsedUrl.protocol === self.paneProtocol)){
        return;
      }
      const conf = atom.config.get('preview-e-r-d');
      self.previewERDView = new PreviewERDView();
      self.previewERDView.setBackgroundColour(conf.backgroundColour);
      return self.previewERDView;
    });

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'preview-e-r-d:toggle': () => this.toggle()
    }));


    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      if(editor.getTitle().endsWith(".erd")){
        editor.onDidSave(() => {
          const preview = this.findPreview(editor.getTitle());
          if(preview){
            preview.setHTML(this.parseErdToHtml(editor.getText()));
          }
        });
      }
    }
  },

  deactivate() {
    // this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.previewERDView.destroy();
  },

  serialize() {
    return {
      // previewERDViewState: this.previewERDView.serialize()
    };
  },

  toggle() {
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      if(!editor.getTitle().endsWith(".erd")){
        atom.notifications.addWarning('Unable to preview a non \'.erd\' file.',
          { detail: 'Only files with a .erd extension can be opened. Rename your file and try again.', dismissable: true}
        );
        return;
      }

      this.closePreview(this.findPreview(editor.getTitle()));

      const uri = `${this.paneProtocol}//editor/${editor.getTitle()}`;

      const previousActivePane = atom.workspace.getActivePane();
      this.openPreview(uri, editor.getTitle(), this.parseErdToHtml(editor.getText()), previousActivePane);
    }
  },

  openPreview(uri, title, html, previousActivePane) {
    atom.workspace.open(uri, {
      split: 'right',
      searchAllPanes: true
    }).then((preview) => {
      if(preview instanceof PreviewERDView){
        preview.setHTML(html);
        preview.setTitle(title);
        if(previousActivePane){
          previousActivePane.activate();
        }
      }
    });
  },

  closePreview(previewPaneItem){
    if (previewPaneItem) {
      const previewPane = atom.workspace.paneForItem(previewPaneItem);
      if(previewPane){
        previewPane.destroyItem(previewPaneItem);
      }
      return;
    }
  },

  findPreview(title){
    return atom.workspace.getPaneItems().find( it => it instanceof PreviewERDView && it.title === title );
  },

  parseErdToHtml(text){
    try{
      return t2erd(text).toString();
    }
    catch(error) {
      atom.notifications.addWarning('Could not parse the given erd syntax.',
          { detail: error}
        );
      return `
      <div>
        <h1>Unable to display the Entity Relationship Diagram</h1>
        <p>Try something like below:</p>
<pre>[table1]
*column1
column2</pre>
        <p>See <a href='https://github.com/dosaki/t2erd/blob/master/README.md#syntax'>the syntax reference</a>.</p>
      </div>
      `
    }
  }
};
