
import board
from digitalio import DigitalInOut, Direction

# LED setup.
led = DigitalInOut(board.LED)
led.direction = Direction.OUTPUT

def turn_off_led(_state):
    led.value = False

def turn_on_led(_state):
    led.value = True


blinky_states = {
  "id": "blinky",
  "initial": "led_off",
  "states": {
    "led_off": {
      "entry": turn_off_led,
      "on": {
        "toggle": {
          "target": "led_on"
        }
      }
    },
    "led_on": {
      "entry": turn_on_led,
      "on": {
        "toggle": {
          "target": "led_off"
        }
      }
    }
  }
}