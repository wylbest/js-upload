const TASK_STATUS = {
  PROCESSING: 1,
  SUCCESS: 2,
  ERROR: 3,
};

class FileUploader {
  // 构造函数，接收一个元素和上传URL
  constructor({ element, uploadURL, taskRenderer }) {
    // 判断element是否为HTMLElement
    if (element instanceof HTMLElement) {
      this.element = element;
    } else {
      throw new Error("element is not a HTMLElement");
    }
    this.uploadURL = uploadURL;
    if (typeof taskRenderer === "function") {
      this.taskRenderer = taskRenderer;
    } else {
      throw new Error("taskRenderer is not a function");
    }
    // 初始化
    this.#init();
  }

  // 属性
  tasks = [];

  // 私有方法
  #init = () => {
    // 获取元素
    const dropAreaDOM = this.element.querySelector(`.drop-area`);
    // 添加drop事件
    dropAreaDOM.addEventListener("drop", this.#handleDrop);
    // 添加drag事件
    dropAreaDOM.addEventListener("dragover", this.#handleDragOver);
  };

  #handleDrop = (e) => {
    // 阻止默认行为
    e.preventDefault();

    // 判断是否是文件
    if (e.dataTransfer.items) {
      // 遍历文件
      for (const item of e.dataTransfer.items) {
        // 判断是否是文件
        if (item.kind === "file") {
          // 获取文件
          const file = item.getAsFile();
          console.log("file", file);
          // 上传文件
          this.#upload(file);
        }
      }
    } else {
      // 遍历文件
      for (const file of e.dataTransfer.files) {
        console.log("file", file);
        // 上传文件
        this.#upload(file);
      }
    }
  };
  #handleDragOver = (e) => {
    // 阻止默认行为
    e.preventDefault();
  };

  #upload = (file) => {
    // 创建表单数据
    const data = new FormData();
    // 添加文件
    data.append("file", file);
    // 创建任务对象
    const task = {
      id: this.tasks.length,
      name: file.name,
      status: TASK_STATUS.PROCESSING,
      progress: 0,
    };
    // 添加任务
    this.tasks.unshift(task);

    // 创建XMLHttpRequest
    const xhr = new XMLHttpRequest();
    // 发送请求
    xhr.open("POST", this.uploadURL);
    // 设置请求头
    xhr.setRequestHeader("x-file-name", encodeURIComponent(file.name));
    // 添加进度事件
    xhr.upload.addEventListener("progress", (e) => {
      const { loaded, total } = e;
      // 计算进度
      const progress = Math.round((loaded / total) * 100);
      // 更新进度
      task.progress = progress;
      this.#updateTask(task);
    });
    // 添加成功事件
    xhr.addEventListener("load", () => {
      task.status = TASK_STATUS.SUCCESS;
      const response = JSON.parse(xhr.response);
      const { url } = response;
      task.url = url;
      this.#updateTask(task);
    });
    // 添加错误事件
    xhr.addEventListener("error", () => {
      task.status = TASK_STATUS.ERROR;
      this.#updateTask(task);
    });
    // 发送请求
    xhr.send(data);
  };

  // 更新任务函数
  #updateTask = (task) => {
    console.log("updateTask", task);
    const taskList = this.element.querySelector(`.task-list`);
    const id = `task-${task.id}`;
    let taskBox = taskList.querySelector(`#${id}`);
    if (!taskBox) {
      taskBox = document.createElement("div");
      taskBox.id = id;
      taskList.prepend(taskBox);
    }
    taskBox.innerHTML = "";
    taskBox.append(this.taskRenderer(task));
  };
}
