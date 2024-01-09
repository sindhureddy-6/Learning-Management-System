
const quill = new Quill("#editor", {
    theme: "snow",
});
document.querySelector(".editor-form").onsubmit = function () {
    document.querySelector("#editorInput").value = quill.root.innerHTML;
      };