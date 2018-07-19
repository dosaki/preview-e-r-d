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
      const html = t2erd(editor.getText()).toString();

      const uri = `${this.paneProtocol}//editor/${editor.getTitle()}`;
      const previousActivePane = atom.workspace.getActivePane();
      const previewPane = atom.workspace.paneForURI(uri);
      if (previewPane) {
        previewPane.destroyItem(previewPane.itemForURI(uri));
        return;
      }
      atom.workspace.open(uri, {
        split: 'right',
        searchAllPanes: true
      }).then((preview) => {
        if(preview instanceof PreviewERDView){
          preview.setHTML(html);
          preview.setTitle(editor.getTitle());
          previousActivePane.activate();
        }
      });
    }
  }

};
