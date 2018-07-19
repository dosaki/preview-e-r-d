'use babel';

export default class PreviewERDView {
  svgContainer: null;

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('preview-e-r-d');
    this.svgContainer = document.createElement('div');
    this.svgContainer.classList.add('preview-e-r-d__svg-container');
    this.element.appendChild(this.svgContainer);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  setTitle(title) {
    return this.title = title;
  }

  getTitle() {
    return this.title ? `${this.title} ERD Preview` : `ERD`
  }

  getElement() {
    return this.element;
  }

  setHTML(html) {
    this.svgContainer.innerHTML=html;
  }

  setBackgroundColour(colour){
    this.element.style = `background:${colour};`
  }
}
