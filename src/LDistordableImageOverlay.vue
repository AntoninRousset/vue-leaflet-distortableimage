<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
} from "@vue-leaflet/vue-leaflet/src/utils.js";
import {
  initDistordableImage,
  props as imageOverlayProps,
  setup as imageOverlaySetup,
} from "./distordableImageOverlay.js";
import { render } from "@vue-leaflet/vue-leaflet/src/functions/layer";

/**
 * ImageOverlay component, render a plain image instead of a geospatial map.
 */
export default {
  name: "LDistordableImageOverlay",
  props: imageOverlayProps,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = imageOverlaySetup(props, leafletRef, context);

    onMounted(async () => {
      let L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");
      const distortableImageOverlay = initDistordableImage(L);
      const { DomEvent } = L;
      leafletRef.value = distortableImageOverlay(props.url, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);
      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render(this.ready, this.$slots);
  },
};
</script>
