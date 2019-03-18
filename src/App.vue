<template>
  <div class="container">
    <h1 class="text-center mb-3" v-if="!showBrokerSelect" @click="showBrokerSelect = true">X-Mas Remote</h1>
    <div class="form-group" v-else>
      <label for="brokerSelection">Select fairy lights:</label>
      <select class="form-control" id="brokerSelection" v-model="selectedBroker" @change="switchMQTT(selectedBroker); showBrokerSelect = false">
        <option v-for="option in MQTT_BASE_OPTIONS" v-bind:value="option">{{ option }}</option>
      </select>
    </div>
    <div class="row">
      <div class="col-sm-3">
        <div class="list-group" id="list-tab" role="tablist">
          <a class="list-group-item list-group-item-action" @click.prevent="selected_mode = '0'" :class="{active: selected_mode == 0}" id="list-home-list" data-toggle="list" href="#list-home" role="tab" aria-controls="home">Static</a>
          <a class="list-group-item list-group-item-action" @click.prevent="selected_mode = '1'" :class="{active: selected_mode != 0}" id="list-profile-list" data-toggle="list" href="#list-profile" role="tab" aria-controls="profile">Animated</a>
        </div>
        <div class="card mt-3">
          <div class="card-header">
            Send bump
          </div>
          <div class="card-body">
            <div class="input-group mb-3">
              <input type="text" class="form-control" placeholder="Bump amount (1-1024)" v-model="bump" aria-label="Bump amount" aria-describedby="basic-addon2">
            </div>
            <div class="text-center"><a href="#" class="btn btn-primary" @click.prevent="sendBump()">Bump!</a></div>
          </div>
        </div>
        <div class="d-flex justify-content-center m-2">
          <button type="button" @click="quickOn()" class="btn btn-success m-2">ON</button>
          <button type="button" @click="quickOff()" class="btn btn-danger m-2">OFF</button>
        </div>
      </div>
      <div class="col-sm-9">
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade" :class="{active: selected_mode == 0, show: selected_mode == 0}" id="list-home" role="tabpanel" aria-labelledby="list-home-list">
            <div class="form-group">
              <label for="formControlRange">Brightness</label>
              <input
                v-model="slider_brightness"
                type="range" 
                min="0" 
                max="100" 
                class="form-control-range" 
                id="formControlRange">
              <small id="emailHelp" class="form-text text-muted text-center">{{slider_brightness}} %</small>
            </div>
            <div class="form-group form-check">
              <input v-model="ck_fade" type="checkbox" class="form-check-input" id="exampleCheck1">
              <label class="form-check-label" for="exampleCheck1">Fade</label>
            </div>
          </div>
          <div class="tab-pane fade" :class="{active: selected_mode != 0, show: selected_mode != 0}" id="list-profile" role="tabpanel" aria-labelledby="list-profile-list">
            <div class="form-group text-center">
              <div class="btn-group btn-group-toggle">
                <label class="btn btn-secondary" :class="{active: selected_mode == 1}">
                  <input type="radio" name="mode" id="1" value="1" autocomplete="off" v-model="selected_mode">Fade In-Out
                </label>
                <label class="btn btn-secondary" :class="{active: selected_mode == 4}">
                  <input type="radio" name="mode" id="4" value="4" autocomplete="off" v-model="selected_mode">Fade In
                </label>
                <label class="btn btn-secondary"  :class="{active: selected_mode == 2}">
                  <input type="radio" name="mode" id="2" value="2" autocomplete="off" v-model="selected_mode">Fade Out
                </label>
                <label class="btn btn-secondary"  :class="{active: selected_mode == 3}">
                  <input type="radio" name="mode" id="3" value="3" autocomplete="off" v-model="selected_mode">Blink
                </label>
                <label class="btn btn-secondary"  :class="{active: selected_mode == 5}">
                  <input type="radio" name="mode" id="5" value="5" autocomplete="off" v-model="selected_mode">Mix
                </label>
              </div>
            </div>
            <div>
              <p class="mb-5">Brightness range:</p>
              <vue-slider 
                ref="slider_min" 
                @mousedown="startDrag" 
                @mouseup="stopDragMinMax" 
                v-model="slider_conf.value" 
                v-bind="slider_conf"
                @drag-start="startDrag"
                @drag-end="stopDragMinMax"
                @callback="val => updateMinMax(val)"></vue-slider>
            </div>
            <div class="form-group">
              <div class="form-row">
                <div class="col">
                  <label for="delay">Delay (ms):</label>
                  <input 
                    type="range" 
                    class="custom-range" 
                    min="0" 
                    max="2000" 
                    step="1" 
                    id="delay" 
                    v-model="delay">
                  <small id="emailHelp" class="form-text text-muted text-center">{{delay}} ms</small>
                </div>
                <div class="col">
                  <label for="step">Step:</label>
                  <input 
                    type="range" 
                    class="custom-range" 
                    min="1" 
                    max="10" 
                    step="1" 
                    id="step" 
                    v-model="step">
                  <small id="emailHelp" class="form-text text-muted text-center">{{step}}</small>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import vueSlider from 'vue-slider-component';
import _ from 'lodash'

export default {
  name: 'app',
  data () {
    return {
      showBrokerSelect: false,
      selectedBroker: '',
      MQTT_BASE: '',
      MQTT_PUB_TOPIC: 'control/',
      MQTT_SUB_TOPIC: 'status/',
      MQTT_BASE_OPTIONS: [
        'house/xmas/',
        'kniwwelino/fairy_cri/',
        'kniwwelino/smc_xmas/',
      ],
      disabledControls: false,
      disabledOnce: false,
      selected_mode: 0,
      slider_brightness: 50,
      ck_fade: false,
      delay: 100,
      step: 1,
      bump: 50,
      slider_conf: {
          value: [0, 100],
          width: '100%',
          height: 8,
          dotSize: 16,
          min: 0,
          max: 100,
          disabled: false,
          show: true,
          useKeyboard: true,
          tooltip: 'always',
          enableCross: false,
          //mergeFormatter: '¥{value1} ~ ¥{value2}',
          bgStyle: {
            backgroundColor: '#fff',
            boxShadow: 'inset 0.5px 0.5px 3px 1px rgba(0,0,0,.36)'
          },
          tooltipStyle: {
            backgroundColor: '#666',
            borderColor: '#666'
          },
          processStyle: {
            backgroundColor: '#999'
          }
      }
    }
  },
  mounted () {
    this.switchMQTT(this.MQTT_BASE_OPTIONS[1]);
    this.selectedBroker = this.MQTT_BASE_OPTIONS[1];
  },
  methods: {
    greet(msg) {
      alert(msg)
    },
    switchMQTT(new_base) {
      if(this.MQTT_BASE != '') this.$mqtt.unsubscribe(this.MQTT_SUB_TOPIC + '#');
      this.MQTT_BASE = new_base;
      this.MQTT_PUB_TOPIC = new_base + 'control/',
      this.MQTT_SUB_TOPIC = new_base + 'status/',
      this.$mqtt.subscribe(this.MQTT_SUB_TOPIC + '#')
      this.$mqtt.publish(this.MQTT_PUB_TOPIC + 'get_status', '0')
    },
    quickOn() {
      this.conditionalPublish('brightness', '1024');
    },
    quickOff() {
      this.conditionalPublish('brightness', '0');
    },
    sendBump() {
      this.conditionalPublish('bump', this.bump.toString());
    },
    startDrag() {
      this.disabledControls = true;
    },
    stopDrag() {
      this.disabledControls = false;
    },
    stopDragBright() {
      this.stopDrag();
      this.conditionalPublish(this.ck_fade ? 'fade' : 'brightness', ((this.slider_brightness/100)*1024).toString());
    },
    stopDragDelay() {
      this.stopDrag();
      this.conditionalPublish('delay', this.delay);
    },
    stopDragStep() {
      this.stopDrag();
      this.conditionalPublish('step', this.step);
    },
    stopDragMinMax() {
      this.stopDrag();
      this.conditionalPublish('min', ((this.slider_conf.value[0]/100)*1024).toString());
      this.conditionalPublish('max', ((this.slider_conf.value[1]/100)*1024).toString());
    },
    updateMinMax(val) {
      this.conditionalPublish('min', ((val[0]/100)*1024).toString());
      this.conditionalPublish('max', ((val[1]/100)*1024).toString());
    },
    conditionalPublish(topic, payload) {
      if(!this.disabledControls && !this.disabledOnce) {
        this.throttledPublish(topic, payload, this)
      }
      this.disabledOnce = false;
    },
    throttledPublish: _.throttle((topic, payload, vue_instance) => {
      console.log("Publishing " + payload + " at " + topic + " [THROTTLED]");
      vue_instance.$mqtt.publish(vue_instance.MQTT_PUB_TOPIC + topic, payload);
    }, 1000),
    setDisabledOnce(cond1, cond2) {
      if(cond1 != cond2) {
        this.disabledOnce = true;
      }
    }
  },
  watch: {
    // whenever slider_brightness changes, this function will run
    slider_brightness: function() {
      this.conditionalPublish(this.ck_fade ? 'fade' : 'brightness', ((this.slider_brightness/100)*1024).toString());
    },
    delay: function() {
      this.conditionalPublish('delay', this.delay);
    },
    step: function() {
      this.conditionalPublish('step', this.step);
    },
  	selected_mode (val) {
      this.conditionalPublish('mode', this.selected_mode.toString());
    	if (val > 0) {
    		this.$nextTick(() => this.$refs.slider_min.refresh());
      }
    }
  },
  mqtt: {
    '#' (data, topic) {
        var data_parsed = String.fromCharCode.apply(null, data)
        console.log('topic:', topic, 'data:', data_parsed)
        switch(topic.split('/').pop()) {
          case 'brightness':
            this.setDisabledOnce(this.slider_brightness, Math.floor((data_parsed/1024)*100));
            this.slider_brightness = Math.floor((data_parsed/1024)*100)
            this.ck_fade = false;
            break;
          case 'fade':
            this.setDisabledOnce(this.slider_brightness, Math.floor((data_parsed/1024)*100));
            this.slider_brightness = Math.floor((data_parsed/1024)*100)
            this.ck_fade = true;
            break;
          case 'delay':
            this.setDisabledOnce(this.delay, data_parsed);
            this.delay = data_parsed;
            break;
          case 'step':
            this.setDisabledOnce(this.step, data_parsed);
            this.step = data_parsed;
            break;
          case 'min':
            this.setDisabledOnce(this.slider_conf.value[0], Math.floor((data_parsed/1024)*100));
            this.slider_conf.value = [Math.floor((data_parsed/1024)*100),this.slider_conf.value[1]];
            break;
          case 'max':
            this.setDisabledOnce(this.slider_conf.value[1], Math.floor((data_parsed/1024)*100));
            this.slider_conf.value = [this.slider_conf.value[0], Math.floor((data_parsed/1024)*100)];
            break;
          case 'mode':
            this.setDisabledOnce(this.selected_mode, data_parsed);
            this.selected_mode = data_parsed;
            break;
          default:
            console.log('Received unknown status code.') 
        }
    },
  },
  components: {
    vueSlider
  }
}
</script>

<style>
</style>
