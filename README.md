# vue-leaflet-rotatedmarker
Rotated marker for vue 3

## Install
There is no npm package yet, you can install it with
```shell
npm install git+https://github.com/AntoninRousset/vue-leaflet-rotatedmarker.git
```

## Usage
```html
<template>
  <l-map>
    <l-marker
      :lat-lng="[0, 0]"
      :rotation-angle="90"  // default: 0
      rotation-origin="center"  // default: "bottom center"
    />
  </l-map>
</template>

<script>
import { LMap } from "@vue-leaflet/vue-leaflet";
import { LMarker } from "vue-leaflet-rotatedmarker";

export default {
  components: { LMap, LMarker },
}
</script>
```

## Credits
Rotation features comes from [Leaflet.RotatedMarker](https://github.com/bbecquet/Leaflet.RotatedMarker), that I could not import without copying it yet and the structure is largely copied from [vue-leaflet/vue-leaflet](https://github.com/vue-leaflet/vue-leaflet).
