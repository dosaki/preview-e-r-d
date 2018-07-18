'use babel';

import PreviewERDView from './preview-e-r-d-view';
import { CompositeDisposable } from 'atom';

export default {

  previewERDView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.previewERDView = new PreviewERDView(state.previewERDViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.previewERDView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'preview-e-r-d:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.previewERDView.destroy();
  },

  serialize() {
    return {
      previewERDViewState: this.previewERDView.serialize()
    };
  },

  toggle() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      let reversed = selection.split('').reverse().join('')
      editor.insertText(reversed)
    }
  }

};
