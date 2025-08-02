const imageUpload = document.getElementById('imageUpload');
const backgroundColor = document.getElementById('backgroundColor');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadButton = document.getElementById('downloadButton');

let originalImage = null;

imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                originalImage = img;
                processImage();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

backgroundColor.addEventListener('change', processImage);

downloadButton.addEventListener('click', function() {
    if (canvas.toBlob) {
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '证件照_背景替换.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
});

function processImage() {
    if (!originalImage) return;

    // 设置canvas尺寸与图片一致
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // 绘制原始图片
    ctx.drawImage(originalImage, 0, 0);

    // 获取图片像素数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 获取背景颜色RGB值
    const color = hexToRgb(backgroundColor.value);

    // 遍历像素，替换背景色
    // 由于原图背景是蓝色，我们需要替换蓝色背景
    // 定义蓝色背景的范围
    const blueTolerance = 30;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];
        
        // 检查像素是否为蓝色背景
        // 蓝色背景的特点是蓝色分量较高，红色和绿色分量较低
        if (b > 100 && b > r + blueTolerance && b > g + blueTolerance) {
            data[i] = color.r;     // Red
            data[i+1] = color.g;   // Green
            data[i+2] = color.b;   // Blue
            // 保持Alpha通道不变
        }
    }

    // 将修改后的像素数据放回canvas
    ctx.putImageData(imageData, 0, 0);

    // 启用下载按钮
    downloadButton.disabled = false;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}