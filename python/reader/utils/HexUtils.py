def hexToBytes(hex):
    """
    hex转bytearray
    :param hex:
    :return:
    """
    return bytearray.fromhex(hex)


def bytesToHex(arr):
    """
    字节数组转hex
    :param arr: 字节数组
    :return:hex
    """
    # if isinstance(arr, (list, bytearray, bytes)):
    try:
        return bytearray(arr).hex()
    except Exception as ex:
        print(ex.args)
        return None


def hexToInt(hexValue):
    """
    hex转int
    :param hexValue:hex
    :return: int
    """
    return int.from_bytes(hexToBytes(hexValue), byteorder='big', signed=False)


def listToAscii(list):
    """
    字节数组转ascii
    :param list: 字节数组
    :return: ascii
    """
    return "".join([chr(x) for x in list])
