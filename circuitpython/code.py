import asyncio
import board

from adafruit_ble import BLERadio
from adafruit_ble.advertising.standard import ProvideServicesAdvertisement
from adafruit_ble.services.nordic import UARTService

# from adafruit_bluefruit_connect.packet import Packet
ble = BLERadio()
uart_service = UARTService()
advertisement = ProvideServicesAdvertisement(uart_service)

async def ble_connetor():
    while True:
        if not ble.connected:
            # Advertise when not connected.
            ble.stop_advertising()
            ble.start_advertising(advertisement)
        await asyncio.sleep(2)

msg = ""
async def ble_listener():
    global msg
    while True:
        if ble.connected:
            if uart_service.in_waiting:
                line = uart_service.readline()
                if line:
                    # print("full", line.decode('utf-8'))
                    msg += line[:-1].decode('utf-8')
                    # print(line[-1:])
                    if line[-1:] == b'\x03': #EOT code 3
                        # print("last part", msg)
                        uart_server.write("{}\n".format(msg))
                        msg = ""
                        await asyncio.sleep(1)
                await asyncio.sleep(0.01)
        await asyncio.sleep(0.01)


async def main():
    interrupt_ble_con = asyncio.create_task(ble_connector())
    interrupt_ble_lis = asyncio.create_task(ble_listener())
    await asyncio.gather(
        interrupt_ble_con, 
        interrupt_ble_lis)

asyncio.run(main())