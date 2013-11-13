(function (w) {
    w.AttitudeIndicator = function (cssSelector, autoUpdate) {
        this.autoUpdate = autoUpdate;
        this.horizontalAngle = 0;
        this.verticalAngle = 0;
        this.noiseBarrier = 0.25;
        this.maximumVerticalDegrees = 30;
        this.minimumVerticalDegrees = -30;
        this.degreesPerLine = 5;
        this.verticalMeasurementlineId = 'artificialHorizon__verticalMeasurementLine';

        this.node = document.querySelector(cssSelector);
        this.initElements();
        this.initMotionListener();

        window.addEventListener('resize', this.resize.bind(this));

        this.resize();
    }

    var p = w.AttitudeIndicator.prototype;

    p.initElements = function () {
        var docFragment = document.createDocumentFragment();

        this.wrapperNode = document.createElement('div');
        this.wrapperNode.className = 'attitude_indicator__wrapper';

        this.movingWrapperNode = document.createElement('div');
        this.movingWrapperNode.className = 'attitude_indicator__wrapperMoving';

        this.groundNode = document.createElement('div');
        this.groundNode.className = 'attitude_indicator__absolute attitude_indicator__half_screen attitude_indicator__ground';
        this.skyNode = document.createElement('div');
        this.skyNode.className = 'attitude_indicator__absolute attitude_indicator__half_screen attitude_indicator__sky';

        this.wrapperNode.appendChild(this.movingWrapperNode);
        this.movingWrapperNode.appendChild(this.groundNode);
        this.movingWrapperNode.appendChild(this.skyNode);

        this.planeMarkNode = document.createElement('div');
        this.planeMarkNode.className = 'attitude_indicator__planeMark attitude_indicator__absolute';
        this.wrapperNode.appendChild(this.planeMarkNode);

        this.planeMarkImage = document.createElement('img');
        this.planeMarkImage.src = w.AttitudeIndicator.path + '/img/plane_mark.gif';

        this.planeMarkImage.style.position = 'absolute';
        this.planeMarkImage.style.top = '50%';

        this.planeMarkImage.setAttribute('width', '100%');
        this.planeMarkImage.setAttribute('height', 'auto');

        this.planeMarkNode.appendChild(this.planeMarkImage);

        docFragment.appendChild(this.wrapperNode);

        this.node.appendChild(docFragment);

        this.createHorizontalDegreesLine();
        this.createHorizontalDegreesMark();
    }

    p.resize = function () {
        this.pixelsInDegree = Math.ceil(this.movingWrapperNode.offsetHeight / 90);
        this.refreshVerticalDegreesLine();
        this.refreshHorizontalMeasurePosition();
    }

    p.refreshHorizontalMeasurePosition = function () {
        var wrapperHeight = this.wrapperNode.offsetHeight;
        var neededCentralBlockHeight = this.horizontalDegreesLine.offsetWidth;
        var horizontalLineTop = (wrapperHeight - neededCentralBlockHeight) / 2;
        this.horizontalDegreesLine.style.top = horizontalLineTop + 'px';

        this.refreshHorizontalMark();
    }

    p.refreshHorizontalMark = function () {
        var length = this.horizontalDegreesLine.offsetWidth;
        this.horizontalDegreesMark.style.height = length + 'px';

        var top = this.horizontalDegreesLine.offsetTop;
        this.horizontalDegreesMark.style.top = top + 'px';
    }

    p.refreshVerticalDegreesLine = function () {
        if (this.verticalMeasurementlineContainer) {
            this.verticalMeasurementline = null;
            this.wrapperNode.removeChild(this.verticalMeasurementlineContainer);
        }

        this.createVerticalDegreesLine();
    }

    p.createHorizontalDegreesLine = function () {
        this.horizontalDegreesLine = document.createElement('div');
        this.horizontalDegreesLine.className = 'artificialHorizon__horizontalDegreesLine';
        this.wrapperNode.appendChild(this.horizontalDegreesLine);
    }

    p.createHorizontalDegreesMark = function () {
        this.horizontalDegreesMark = document.createElement('div');
        this.horizontalDegreesMark.className = 'artificialHorizon__horizontalDegreesMark';
        this.wrapperNode.appendChild(this.horizontalDegreesMark);
    }

    p.createVerticalDegreesLine = function () {
        var lineContainer = document.createElement('div');
        lineContainer.className = 'artificialHorizon__verticalMeasurementLine_container';
        lineContainer.id = this.verticalMeasurementlineId;

        var lineComponent = document.createElement('div');
        lineComponent.className = 'artificialHorizon__verticalMeasurementLine';

        var divHeight = this.pixelsInDegree * this.degreesPerLine;
        var amountOfLines = (360 / this.degreesPerLine);
        var offsetTop = this.wrapperNode.offsetHeight / 4;

        for (var i = -(amountOfLines / 2); i < amountOfLines; i++) {
            var line = document.createElement('div');
            line.className = 'artificialHorizon__verticalMeasurementLine__verticalLine';
            line.style.top = (i * divHeight + offsetTop) + 'px';

            var lineValue = i * this.degreesPerLine
            if (lineValue % 2 === 0) {
                var label = document.createElement('p');
                label.className = 'artificialHorizon__verticalMeasurementLine__label';
                label.innerHTML = Math.abs(lineValue);
                line.style.width = '100%'
                line.style.marginLeft = '0%'
                line.appendChild(label);
            }
            lineComponent.appendChild(line);
        }

        lineContainer.appendChild(lineComponent);

        this.verticalMeasurementline = lineComponent;
        this.verticalMeasurementlineContainer = lineContainer;

        this.wrapperNode.appendChild(this.verticalMeasurementlineContainer);
    }

    p.updateAngles = function (horizontalAngleDegrees, verticalAngleDegrees) {
        var horizontalChanged = this.horizontalAngle !== horizontalAngleDegrees;
        var verticalChanged = this.verticalAngle !== verticalAngleDegrees;

        if (horizontalChanged === true) {
            this.horizontalDegreesMark.style.webkitTransform = 'rotate(' + horizontalAngleDegrees + 'deg)';
            this.horizontalDegreesMark.style.transform = 'rotate(' + horizontalAngleDegrees + 'deg)';
            this.horizontalAngle = horizontalAngleDegrees;
        }

        if (verticalChanged === true) {
            var verticalAngleLimited = Math.min(verticalAngleDegrees, this.maximumVerticalDegrees);
            verticalAngleLimited = Math.max(verticalAngleDegrees, this.minimumVerticalDegrees);

            var verticalTransformLimited = verticalAngleLimited * this.pixelsInDegree;
            var verticalTransform = verticalAngleDegrees * this.pixelsInDegree;

            this.verticalMeasurementline.style.webkitTransform = 'translate(0, ' + verticalTransform + 'px)';
            this.verticalMeasurementline.style.transform = 'translate(0, ' + verticalTransform + 'px)';

            this.verticalAngle = verticalAngleDegrees;
        }

        if ( horizontalChanged === true || verticalChanged === true) {
            this.movingWrapperNode.style.webkitTransform = 'rotate(' + (-horizontalAngleDegrees) + 'deg) translate(0, ' + verticalTransformLimited + 'px)';
            this.movingWrapperNode.style.transform = 'rotate(' + (-horizontalAngleDegrees) + 'deg) translate(0, ' + verticalTransformLimited + 'px)';
        }

        this.horizontalAngle = horizontalAngleDegrees;
        this.verticalAngle = verticalAngleDegrees;
    }

    p.initMotionListener = function () {
        if (w.DeviceOrientationEvent !== undefined && this.autoUpdate !== false) {
            w.addEventListener('deviceorientation', this.onOrientationChanged.bind(this));
        }
    }

    p.onOrientationChanged = function (e) {
        var verticalAngle = e[this.getVerticalAxis()];

        if (window.AttitudeIndicator.iOS === true) {
            verticalAngle = -verticalAngle - 90;
        }

        var newHorizontalAngle = this.filterByNoiseBarrier(this.horizontalAngle, e[this.getHorizontalAxis()]);
        var newVerticalAngle = this.filterByNoiseBarrier(this.verticalAngle, verticalAngle);

        this.updateAngles(newHorizontalAngle, newVerticalAngle);
    }

    p.getHorizontalAxis = function () {
        if (this.horizontalAxis === undefined) {
            if (window.AttitudeIndicator.iOS) {
                this.horizontalAxis = 'beta';
            } else {
                this.horizontalAxis = 'gamma';
            }
        }
        return this.horizontalAxis;
    }

    p.getVerticalAxis = function () {
        if (this.verticalAxis === undefined) {
            if (window.AttitudeIndicator.iOS) {
                this.verticalAxis = 'gamma';
            } else {
                this.verticalAxis = 'beta';
            }
        }
        return this.verticalAxis;
    }

    p.filterByNoiseBarrier = function (oldVar, newVar) {
        if (Math.abs(oldVar - newVar) > this.noiseBarrier) {
            oldVar = newVar;
        }
        return oldVar;
    }
})(window);

//Styles initialization
var head = document.getElementsByTagName('head')[0];
var styleTag = document.createElement('link');
var scripts = document.getElementsByTagName("script");
var src = scripts[scripts.length - 1].src.substring(0, scripts[scripts.length - 1].src.lastIndexOf('/') + 1);
styleTag.href = src + 'attitude_indicator.css';
styleTag.rel = 'stylesheet';
styleTag.type = 'text/css';
head.appendChild(styleTag);

window.AttitudeIndicator.path = src;
window.AttitudeIndicator.iOS = ( navigator.userAgent.match(/iP\w+/g) ? true : false );

// Mozilla bind polyfill
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {
            },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}