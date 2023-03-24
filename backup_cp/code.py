import asyncio
import statemachine
from blinky_states import blinky_states

async def toggle_timer(rate):
    while True:
        
        await asyncio.sleep(rate)
        statemachine.enqueue("toggle")

async def main():
    toggle_timer_loop = asyncio.create_task(toggle_timer(0.5))
    statemachine_loop = asyncio.create_task(statemachine.xstate_interpreter(blinky_states))
    await asyncio.gather(toggle_timer_loop, statemachine_loop)

asyncio.run(main())
