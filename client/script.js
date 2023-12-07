const taskTemplate = document.querySelector("#task-template");

new FileUploader({
  // 设置要上传的文件元素
  element: document.querySelector(".dnd-file-uploader"),
  // 设置要上传的URL
  uploadURL: "http://localhost:3000/upload",
  taskRenderer: (task) => {
    const taskDom = taskTemplate.content.firstElementChild.cloneNode(true);
    const nameDom = taskDom.querySelector(".task-name");
    nameDom.textContent = task.name;
    const progressDom = taskDom.querySelector(".task-progress");
    const progress = `${task.progress}%`;
    progressDom.textContent = progress;

    taskDom.style.transition = "0.2s all";
    if (task.status === TASK_STATUS.PROCESSING) {
      taskDom.style.background = `linear-gradient(to right, #bae7ff ${progress}, #fafafa ${progress}, #fafafa 100%)`;
    } else if (task.status === TASK_STATUS.SUCCESS) {
      taskDom.style.background = `#d9f7be`;
      nameDom.href = task.url;
    } else if (task.status === TASK_STATUS.ERROR) {
      taskDom.style.background = `#ffccc7`;
    }
    return taskDom;
  },
});
