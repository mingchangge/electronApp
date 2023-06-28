<template>
  <div>
    <div class="row">
      <h2>pdf预览</h2>
      <div class="col-sm-4">
        <a :href="fileUrl" target="_blank" >
            <canvas :id="_uid" />         
        </a>
      </div>
    </div>
  </div>
</template>

<script>
// npm install pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.js?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker 

export default {
  name: 'PdfThumbnail',
  props: {
    fileUrl: {
      type: String,
    },
    width: {
      type: Number,
      default: 200,
    },
    height: {
      type: Number,
      default: 200,
    },
  },
  data() {
    return {
      _uid: 'canvas',
    };
  },
  mounted() {
    this.renderThumbnails()
  },
  methods: {
    async renderThumbnails() {
      const worker = new pdfjsLib.PDFWorker()
      let pdf = await pdfjsLib
        .getDocument({ url: this.fileUrl, worker: worker })
        .promise.then((pdf) => pdf)
      const page = await pdf.getPage(1)
      let viewport = page.getViewport({ scale: 1.0 })
      viewport = page.getViewport({ scale: this.width / viewport.width })
      let canvas = document.getElementById(this._uid)
      canvas.height = viewport.height
      canvas.width = viewport.width
      const context = canvas.getContext('2d')
      await page.render({ canvasContext: context, viewport: viewport })
    }
  },
}
</script>

<style>
</style>