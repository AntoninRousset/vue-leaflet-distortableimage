import {
  props as layerProps,
  setup as layerSetup,
} from "@vue-leaflet/vue-leaflet/src/functions/layer";
/**
 * @typedef {import('leaflet/dist/leaflet-src.esm.js').LatLngBounds} LatLngBounds
 */

export const props = {
  ...layerProps,
  url: {
    type: String,
    required: true,
  },
  corners: {
    type: [Array],
    required: true,
  },
  editable: {
    type: Boolean,
    default: true,
  },
  opacity: {
    type: Number,
    custom: true,
    default: 1.0,
  },
  alt: {
    type: String,
    default: "",
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  crossOrigin: {
    type: Boolean,
    default: false,
  },
  errorOverlayUrl: {
    type: String,
    custom: true,
    default: "",
  },
  zIndex: {
    type: Number,
    custom: true,
    default: 1,
  },
  className: {
    type: String,
    default: "",
  },
};

export const setup = (setupProps, LeafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = layerSetup(
    setupProps,
    LeafletRef,
    context
  );
  const options = {
    ...layerOptions,
    ...setupProps,
  };

  const methods = {
    ...layerMethods,
    /**
     * Sets the opacity of the overlay.
     * @param {number} opacity
     */
    setOpacity(opacity) {
      return LeafletRef.value.setOpacity(opacity);
    },
    /**
     * Changes the URL of the image.
     * @param {string} url
     */
    setUrl(url) {
      return LeafletRef.value.setUrl(url);
    },
    /**
     * Update the bounds that this ImageOverlay covers
     * @param {LatLngBounds | Array<Array<number>>} bounds
     */
    setBounds(bounds) {
      return LeafletRef.value.setBounds(bounds);
    },
    /**
     * Get the bounds that this ImageOverlay covers
     * @returns {LatLngBounds}
     */
    getBounds() {
      return LeafletRef.value.getBounds();
    },
    /**
     * Returns the instance of HTMLImageElement used by this overlay.
     * @returns {HTMLElement}
     */
    getElement() {
      return LeafletRef.value.getElement();
    },
    /**
     * Brings the layer to the top of all overlays.
     */
    bringToFront() {
      return LeafletRef.value.bringToFront();
    },
    /**
     * Brings the layer to the bottom of all overlays.
     */
    bringToBack() {
      return LeafletRef.value.bringToBack();
    },
    /**
     * Changes the zIndex of the image overlay.
     * @param {number} zIndex
     */
    setZIndex(zIndex) {
      return LeafletRef.value.setZIndex(zIndex);
    },
  };

  return { options, methods };
};

// Copied from https://github.com/publiclab/Leaflet.DistortableImage/
export function initDistortableImage(L) {
  const TrigUtil = {

    calcAngle(x, y, unit = 'deg') {
      return unit === 'deg' ?
          this.radiansToDegrees(Math.atan2(y, x)) :
          Math.atan2(y, x);
    },

    radiansToDegrees(angle) {
      return (angle * 180) / Math.PI;
    },

    degreesToRadians(angle) {
      return (angle * Math.PI) / 180;
    },
  };

  const MatrixUtil = {

    // Compute the adjugate of m
    adj(m) {
      return [
        m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
        m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
        m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3],
      ];
    },

    // multiply two 3*3 matrices
    multmm(a, b) {
      var c = [];
      var i;

      for (i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          var cij = 0;

          for (var k = 0; k < 3; k++) {
            cij += a[3*i + k]*b[3*k + j];
          }

          c[3*i + j] = cij;
        }
      }

      return c;
    },

    // multiply a 3*3 matrix and a 3-vector
    multmv(m, v) {
      return [
        m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
        m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
        m[6]*v[0] + m[7]*v[1] + m[8]*v[2],
      ];
    },

    // multiply a scalar and a 3*3 matrix
    multsm(s, m) {
      var matrix = [];

      for (var i = 0, l = m.length; i < l; i++) {
        matrix.push(s*m[i]);
      }

      return matrix;
    },

    basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
      var m = [
        x1, x2, x3,
        y1, y2, y3,
        1, 1, 1,
      ];
      var v = MatrixUtil.multmv(MatrixUtil.adj(m), [x4, y4, 1]);

      return MatrixUtil.multmm(m, [
        v[0], 0, 0,
        0, v[1], 0,
        0, 0, v[2],
      ]);
    },

    project(m, x, y) {
      var v = MatrixUtil.multmv(m, [x, y, 1]);

      return [v[0]/v[2], v[1]/v[2]];
    },

    general2DProjection(
        x1s, y1s, x1d, y1d,
        x2s, y2s, x2d, y2d,
        x3s, y3s, x3d, y3d,
        x4s, y4s, x4d, y4d
    ) {
      var s = MatrixUtil.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
      var d = MatrixUtil.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
      var m = MatrixUtil.multmm(d, MatrixUtil.adj(s));

      // Normalize to the unique matrix with m[8] == 1.
      // See: http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/

      return MatrixUtil.multsm(1/m[8], m);
    },
  };

  const Utils = {
    initTranslation() {
      var translation = {
        deleteImage: 'Delete Image',
        deleteImages: 'Delete Images',
        distortImage: 'Distort Image',
        dragImage: 'Drag Image',
        exportImage: 'Export Image',
        exportImages: 'Export Images',
        removeBorder: 'Remove Border',
        addBorder: 'Add Border',
        freeRotateImage: 'Free rotate Image',
        geolocateImage: 'Geolocate Image',
        lockMode: 'Lock Mode',
        lockImages: 'Lock Images',
        makeImageOpaque: 'Make Image Opaque',
        makeImageTransparent: 'Make Image Transparent',
        restoreImage: 'Restore Natural Image',
        rotateImage: 'Rotate Image',
        scaleImage: 'Scale Image',
        stackToFront: 'Stack to Front',
        stackToBack: 'Stack to Back',
        unlockImages: 'Unlock Images',
        confirmImageDelete:
          'Are you sure? This image will be permanently deleted from the map.',
        confirmImagesDeletes:
          'Are you sure? These images will be permanently deleted from the map.',
      };

      if (!this.options.translation) {
        this.options.translation = translation;
      } else {
        // If the translation for a word is not specified, fallback to English.
        for (var key in translation) {
          if (Object.prototype.hasOwnProperty.call(!this.options.translation, key)) {
            this.options.translation[key] = translation[key];
          }
        }
      }

      DomUtil.initTranslation(this.options.translation);
    },

    getNestedVal(obj, key, nestedKey) {
      var dig = [key, nestedKey];
      return dig.reduce(function(obj, k) {
        return obj && obj[k];
      }, obj);
    },
  };

  const DomUtil = L.extend(L.DomUtil, {
    initTranslation(obj) {
      this.translation = obj;
    },

    getMatrixString(m) {
      var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d;

      /*
       * Since matrix3d takes a 4*4 matrix, we add in an empty row and column,
       * which act as the identity on the z-axis.
       * See:
       *     http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
       *     https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#M.C3.B6bius'_homogeneous_coordinates_in_projective_geometry
       */
      var matrix = [
        m[0], m[3], 0, m[6],
        m[1], m[4], 0, m[7],
        0, 0, 1, 0,
        m[2], m[5], 0, m[8],
      ];

      var str = is3d ? 'matrix3d(' + matrix.join(',') + ')' : '';

      if (!is3d) {
        console
            .log('Your browser must support 3D CSS transforms' +
            'in order to use DistortableImageOverlay.');
      }

      return str;
    },

    toggleClass(el, className) {
      var c = className;
      return this.hasClass(el, c) ?
        this.removeClass(el, c) : this.addClass(el, c);
    },

    confirmDelete() {
      return window.confirm(this.translation.confirmImageDelete);
    },

    confirmDeletes(n) {
      if (n === 1) { return this.confirmDelete(); }

      var translation = this.translation.confirmImagesDeletes;
      var warningMsg = '';

      if (typeof translation === 'function') {
        warningMsg = translation(n);
      } else {
        warningMsg = translation;
      }

      return window.confirm(warningMsg);
    },
  });

  const DistortableImageOverlay = L.ImageOverlay.extend({
    options: {
      height: 200,
      crossOrigin: true,
      // todo: find ideal number to prevent distortions during RotateScale, and make it dynamic (remove hardcoding)
      edgeMinWidth: 50,
      editable: true,
      mode: "distort",
      selected: false,
    },

    initialize: function (url, options) {
      L.setOptions(this, options);
      Utils.initTranslation.call(this, L);

      this.edgeMinWidth = this.options.edgeMinWidth;
      this.editable = this.options.editable;
      this._selected = this.options.selected;
      this._url = url;
      this.rotation = {};
    },

    onAdd: function (map) {
      this._map = map;
      if (!this.getElement()) {
        this._initImage();
      }

      map.on("viewreset", this._reset, this);

      if (this.options.corners) {
        this._corners = this.options.corners;
        if (map.options.zoomAnimation && L.Browser.any3d) {
          map.on("zoomanim", this._animateZoom, this);
        }
      }

      // Have to wait for the image to load because need to access its w/h
      L.DomEvent.on(this.getElement(), "load", () => {
        this.getPane().appendChild(this.getElement());
        this._initImageDimensions();

        if (this.options.rotation) {
          var units = this.options.rotation.deg ? "deg" : "rad";
          this.setAngle(this.options.rotation[units], units);
        } else {
          this.rotation = { deg: 0, rad: 0 };
          this._reset();
        }

        /* Initialize default corners if not already set */
        if (!this._corners) {
          if (map.options.zoomAnimation && L.Browser.any3d) {
            map.on("zoomanim", this._animateZoom, this);
          }
        }

        /** if there is a featureGroup, only its editable option matters */
	/*
        var eventParents = this._eventParents;
        if (eventParents) {
          this.eP = eventParents[Object.keys(eventParents)[0]];
          if (this.eP.editable) {
            this.editing.enable();
          }
        } else {
          if (this.editable) {
            this.editing.enable();
          }
          this.eP = null;
        }
	*/
      });

      L.DomEvent.on(this.getElement(), "click", this.select, this);
      L.DomEvent.on(
        map,
        {
          singleclickon: this._singleClickListeners,
          singleclickoff: this._resetClickListeners,
          singleclick: this._singleClick,
        },
        this
      );

      /**
       * custom events fired from DoubleClickLabels.js. Used to differentiate
       * single / dblclick to not deselect images on map dblclick.
       */
      if (!(map.doubleClickZoom.enabled() || map.doubleClickLabels.enabled())) {
        L.DomEvent.on(map, "click", this.deselect, this);
      }

      this.fire("add");
    },

    onRemove: function (map) {
      L.DomEvent.off(this.getElement(), "click", this.select, this);
      L.DomEvent.off(
        map,
        {
          singleclickon: this._singleClickListeners,
          singleclickoff: this._resetClickListeners,
          singleclick: this._singleClick,
        },
        this
      );
      L.DomEvent.off(map, "click", this.deselect, this);

      if (this.editing) {
        this.editing.disable();
      }
      this.fire("remove");

      L.ImageOverlay.prototype.onRemove.call(this, map);
    },

    _initImageDimensions: function () {
      var map = this._map;
      var originalImageWidth = L.DomUtil.getStyle(this.getElement(), "width");
      var originalImageHeight = L.DomUtil.getStyle(this.getElement(), "height");
      var aspectRatio =
        parseInt(originalImageWidth) / parseInt(originalImageHeight);
      var imageHeight = this.options.height;
      var imageWidth = parseInt(aspectRatio * imageHeight);
      var center = map.project(map.getCenter());
      var offset = L.point(imageWidth, imageHeight).divideBy(2);
      if (this.options.corners) {
        this._corners = this.options.corners;
      } else {
        this._corners = [
          map.unproject(center.subtract(offset)),
          map.unproject(center.add(L.point(offset.x, -offset.y))),
          map.unproject(center.add(L.point(-offset.x, offset.y))),
          map.unproject(center.add(offset)),
        ];
      }

      this._initialDimensions = {
        center: center,
        offset: offset,
        zoom: map.getZoom(),
      };

      this.setBounds(L.latLngBounds(this.getCorners()));
    },

    _singleClick: function (e) {
      if (e.type === "singleclick") {
        this.deselect();
      } else {
        return;
      }
    },

    _singleClickListeners: function () {
      var map = this._map;
      L.DomEvent.off(map, "click", this.deselect, this);
      L.DomEvent.on(map, "singleclick", this.deselect, this);
    },

    _resetClickListeners: function () {
      var map = this._map;
      L.DomEvent.on(map, "click", this.deselect, this);
      L.DomEvent.off(map, "singleclick", this.deselect, this);
    },

    isSelected: function () {
      return this._selected;
    },

    deselect: function () {
      var edit = this.editing;
      if (!edit.enabled()) {
        return;
      }

      edit._removeToolbar();
      edit._hideMarkers();

      this._selected = false;
      this.fire("deselect");
      return this;
    },

    select: function (e) {
      var edit = this.editing;
      var eP = this.eP;

      if (!edit.enabled()) {
        return;
      }
      if (e) {
        L.DomEvent.stopPropagation(e);
      }

      // this ensures deselection of all other images, allowing us to keep collection group optional
      this._programmaticGrouping();

      this._selected = true;
      edit._addToolbar();
      edit._showMarkers();
      this.fire("select");

      // we run the selection logic 1st anyway because the collection group's _addToolbar method depends on it
      if (eP && eP.anyCollected()) {
        this.deselect();
        return;
      }

      return this;
    },

    _programmaticGrouping: function () {
      this._map.eachLayer((layer) => {
        if (layer instanceof DistortableImageOverlay) {
          layer.deselect();
        }
      });
    },

    setCorner: function (corner, latlng) {
      var edit = this.editing;

      this._corners[corner] = latlng;

      this.setBounds(L.latLngBounds(this.getCorners()));
      this.fire("update");

      if (edit.toolbar && edit.toolbar instanceof L.DistortableImage.PopupBar) {
        edit._updateToolbarPos();
      }

      this.edited = true;

      return this;
    },

    _cornerExceedsMapLats: function (zoom, corner, map) {
      var exceedsTop;
      var exceedsBottom;
      if (zoom === 0) {
        exceedsTop = map.project(corner).y < 2;
        exceedsBottom = map.project(corner).y >= 255;
      } else {
        exceedsTop = map.project(corner).y / zoom < 2;
        exceedsBottom = map.project(corner).y / Math.pow(2, zoom) >= 255;
      }
      return exceedsTop || exceedsBottom;
    },

    setCorners: function (latlngObj) {
      var map = this._map;
      var zoom = map.getZoom();
      var edit = this.editing;
      var i = 0;

      // this is to fix https://github.com/publiclab/Leaflet.DistortableImage/issues/402
      for (var k in latlngObj) {
        if (this._cornerExceedsMapLats(zoom, latlngObj[k], map)) {
          // calling reset / update w/ the same corners bc it prevents a marker flicker for rotate
          this.setBounds(L.latLngBounds(this.getCorners()));
          this.fire("update");
          return;
        }
      }

      for (k in latlngObj) {
        this._corners[i] = latlngObj[k];
        i += 1;
      }

      this.setBounds(L.latLngBounds(this.getCorners()));
      this.fire("update");

      if (edit.toolbar && edit.toolbar instanceof L.DistortableImage.PopupBar) {
        edit._updateToolbarPos();
      }

      this.edited = true;

      return this;
    },

    setCornersFromPoints: function (pointsObj) {
      var map = this._map;
      var zoom = map.getZoom();
      var edit = this.editing;
      var i = 0;

      for (var k in pointsObj) {
        var corner = map.layerPointToLatLng(pointsObj[k]);

        if (this._cornerExceedsMapLats(zoom, corner, map)) {
          // calling reset / update w/ the same corners bc it prevents a marker flicker for rotate
          this.setBounds(L.latLngBounds(this.getCorners()));
          this.fire("update");
          return;
        }
      }

      for (k in pointsObj) {
        this._corners[i] = map.layerPointToLatLng(pointsObj[k]);
        i += 1;
      }

      this.setBounds(L.latLngBounds(this.getCorners()));
      this.fire("update");

      if (edit.toolbar && edit.toolbar instanceof L.DistortableImage.PopupBar) {
        edit._updateToolbarPos();
      }

      this.edited = true;

      return this;
    },

    scaleBy: function (scale) {
      var map = this._map;
      var center = map.project(this.getCenter());
      var i;
      var p;
      var scaledCorners = {};

      if (scale === 0) {
        return;
      }

      for (i = 0; i < 4; i++) {
        p = map
          .project(this.getCorner(i))
          .subtract(center)
          .multiplyBy(scale)
          .add(center);
        scaledCorners[i] = map.unproject(p);
      }

      this.setCorners(scaledCorners);

      return this;
    },

    getAngle: function (unit = "deg") {
      var matrix = this.getElement()
        .style[L.DomUtil.TRANSFORM].split("matrix3d")[1]
        .slice(1, -1)
        .split(",");

      var row0x = matrix[0];
      var row0y = matrix[1];
      var row1x = matrix[4];
      var row1y = matrix[5];

      var determinant = row0x * row1y - row0y * row1x;

      var angle = TrigUtil.calcAngle(row0x, row0y, "rad");

      if (determinant < 0) {
        angle += angle < 0 ? Math.PI : -Math.PI;
      }

      if (angle < 0) {
        angle = 2 * Math.PI + angle;
      }

      return unit === "deg"
        ? Math.round(TrigUtil.radiansToDegrees(angle))
        : L.Util.formatNum(angle, 2);
    },

    setAngle: function (angle, unit = "deg") {
      var currentAngle = this.getAngle(unit);
      var angleToRotateBy = angle - currentAngle;
      this.rotateBy(angleToRotateBy, unit);

      return this;
    },

    rotateBy: function (angle, unit = "deg") {
      var map = this._map;
      var center = map.project(this.getCenter());
      var corners = {};
      var i;
      var p;
      var q;

      if (unit === "deg") {
        angle = TrigUtil.degreesToRadians(angle);
      }

      for (i = 0; i < 4; i++) {
        p = map.project(this.getCorner(i)).subtract(center);
        q = L.point(
          Math.cos(angle) * p.x - Math.sin(angle) * p.y,
          Math.sin(angle) * p.x + Math.cos(angle) * p.y
        );
        corners[i] = map.unproject(q.add(center));
      }

      this.setCorners(corners);

      return this;
    },

    dragBy: function (formerPoint, newPoint) {
      var map = this._map;
      var i;
      var p;
      var transCorners = {};
      var delta = map.project(formerPoint).subtract(map.project(newPoint));

      for (i = 0; i < 4; i++) {
        p = map.project(this.getCorner(i)).subtract(delta);
        transCorners[i] = map.unproject(p);
      }

      this.setCorners(transCorners);
    },

    restore: function () {
      var map = this._map;
      var center = this._initialDimensions.center;
      var offset = this._initialDimensions.offset;
      var zoom = this._initialDimensions.zoom;
      var corners = [
        center.subtract(offset),
        center.add(L.point(offset.x, -offset.y)),
        center.add(L.point(-offset.x, offset.y)),
        center.add(offset),
      ];

      for (var i = 0; i < 4; i++) {
        if (!map.unproject(corners[i], zoom).equals(this.getCorner(i))) {
          this.setCorner(i, map.unproject(corners[i], zoom));
        }
      }

      this.edited = false;
      this.fire("restore");

      return this;
    },

    /* Copied from Leaflet v0.7 https://github.com/Leaflet/Leaflet/blob/66282f14bcb180ec87d9818d9f3c9f75afd01b30/src/dom/DomUtil.js#L189-L199 */
    /* since L.DomUtil.getTranslateString() is deprecated in Leaflet v1.0 */
    _getTranslateString: function (point) {
      // on WebKit browsers (Chrome/Safari/iOS Safari/Android)
      // using translate3d instead of translate
      // makes animation smoother as it ensures HW accel is used.
      // Firefox 13 doesn't care
      // (same speed either way), Opera 12 doesn't support translate3d

      var is3d = L.Browser.webkit3d;
      var open = "translate" + (is3d ? "3d" : "") + "(";
      var close = (is3d ? ",0" : "") + ")";

      return open + point.x + "px," + point.y + "px" + close;
    },

    _reset: function () {
      var map = this._map;
      var image = this.getElement();
      var latLngToLayerPoint = L.bind(map.latLngToLayerPoint, map);
      var transformMatrix =
        this._calculateProjectiveTransform(latLngToLayerPoint);
      var topLeft = latLngToLayerPoint(this.getCorner(0));
      var warp = L.DomUtil.getMatrixString(transformMatrix);
      var translation = this._getTranslateString(topLeft);

      /* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
      image._leaflet_pos = topLeft;

      image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(" ");

      /* Set origin to the upper-left corner rather than
       * the center of the image, which is the default.
       */
      image.style[L.DomUtil.TRANSFORM + "-origin"] = "0 0 0";

      this.rotation.deg = this.getAngle();
      this.rotation.rad = this.getAngle("rad");
    },

    /*
     * Calculates the transform string that will be
     * correct *at the end* of zooming.
     * Leaflet then generates a CSS3 animation between the current transform and
     * future transform which makes the transition appear smooth.
     */
    _animateZoom: function (event) {
      var map = this._map;
      var image = this.getElement();
      var latLngToNewLayerPoint = function (latlng) {
        return map._latLngToNewLayerPoint(latlng, event.zoom, event.center);
      };
      var transformMatrix = this._calculateProjectiveTransform(
        latLngToNewLayerPoint
      );
      var topLeft = latLngToNewLayerPoint(this.getCorner(0));
      var warp = L.DomUtil.getMatrixString(transformMatrix);
      var translation = this._getTranslateString(topLeft);

      /* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
      image._leaflet_pos = topLeft;

      image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(" ");
    },

    getCorners: function () {
      return this._corners;
    },

    getCorner: function (i) {
      return this._corners[i];
    },

    // image (vertex) centroid calculation
    getCenter: function () {
      var map = this._map;
      var reduce = this.getCorners().reduce(function (agg, corner) {
        return agg.add(map.project(corner));
      }, L.point(0, 0));
      return map.unproject(reduce.divideBy(4));
    },

    _calculateProjectiveTransform: function (latLngToCartesian) {
      /* Setting reasonable but made-up image defaults
       * allow us to place images on the map before
       * they've finished downloading. */
      var offset = latLngToCartesian(this.getCorner(0));
      var w = this.getElement().offsetWidth || 500;
      var h = this.getElement().offsetHeight || 375;
      var c = [];
      var j;
      /* Convert corners to container points (i.e. cartesian coordinates). */
      for (j = 0; j < 4; j++) {
        c.push(latLngToCartesian(this.getCorner(j))._subtract(offset));
      }

      /*
       * This matrix describes the action of
       * the CSS transform on each corner of the image.
       * It maps from the coordinate system centered
       * at the upper left corner of the image
       * to the region bounded by the latlngs in this._corners.
       * For example:
       * 0, 0, c[0].x, c[0].y
       * says that the upper-left corner of the image
       * maps to the first latlng in this._corners.
       */
      return MatrixUtil.general2DProjection(
        0, 0, c[0].x, c[0].y,
        w, 0, c[1].x, c[1].y,
        0, h, c[2].x, c[2].y,
        w, h, c[3].x, c[3].y
      );
    },
  });

  const distortableImageOverlay = function (id, options) {
    return new DistortableImageOverlay(id, options);
  };

  L.Map.addInitHook(function () {
    if (!L.DomUtil.hasClass(this.getContainer(), "ldi")) {
      L.DomUtil.addClass(this.getContainer(), "ldi");
    }
  });

  return distortableImageOverlay;
}
