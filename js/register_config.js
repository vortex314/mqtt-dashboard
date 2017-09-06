ESP8266 = {
	"SPI1_CLOCK_REG": {
		"desc": "SPI1_CLOCK_REG (0x18)",
		"name": "SPI1_CLOCK_REG",
		"address": "60000118",
		"bits":[
		 ["SPI_CLKCNT_L",0,6,""],
		 ["SPI_CLKCNT_H", 6,6,""],
		 ["SPI_CLKCNT_N",12, 6,""],
		 ["SPI_CLKDIV_PRE",18,13,""],
		 ["SPI_CLK_EQU_SYSCLK",31,1,""]
		 ]
	},
	"SPI1_CTRL": {
		"desc": "SPI1_CTRL (0x8)",
		"name": "SPI1_CTRL",
		"address": "60000108",
		"bits": [
		 ["SPI_WR_BIT_ORDER",26,1,""],
		 ["SPI_RD_BIT_ORDER",25,1,""],
		 ["SPI_QIO_MODE",24,1,""],
		 ["SPI_DIO_MODE",23,1,""],
		 ["SPI_WSR_2B",22,1,"ESP32:two bytes data will be written to status register when it is set. 1: enable 0: disable."],
		 ["SPI_WP_REG",21,1,"ESP32:Write protect signal output when SPI is idle.  1: output high  0: output low."],
		 ["SSPI_QOUT_MODE",20,1,""],
		 ["SPI_DOUT_MODE",14,1,""],
		 ["SPI_FASTRD_MODE",13,1,""]
		 ]
		},
	"SPI1_CTRL2": {
		"desc": "SPI1_CTRL2 (0x14)",
		"name": "SPI1_CTRL2",
		"address": "60000114",
		"bits": [
		 ["SPI_CS_DELAY_NUM",28,4,""],
		 ["SPI_CS_DELAY_MODE",26,2,""],
		 ["SPI_MOSI_DELAY_NUM",23,3,""],
		 ["SPI_MOSI_DELAY_MODE",21,2,""],
		 ["SPI_MISO_DELAY_NUM",18,3,""],
		 ["SPI_MISO_DELAY_MODE",16,2,"MISO signals are delayed by spi_clk. 0: zero  1: if spi_ck_out_edge  or spi_ck_i_edge is set 1  delayed by half cycle    else delayed by one cycle  2: if spi_ck_out_edge or spi_ck_i_edge is set 1  delayed by one cycle  else delayed by half cycle  3: delayed one cycle"],
		 ["SPI_CK_OUT_HIGH_MODE",12,4,"modify spi clock duty ratio when the value is lager than 8, the bits are combined with spi_clkcnt_N bits and spi_clkcnt_H bits."],
		 ["SPI_CK_OUT_LOW_MODE",8,4,"modify spi clock duty ratio when the value is lager than 8, the bits are combined with spi_clkcnt_N bits and spi_clkcnt_L bits"],
		 ["SPI_HOLD_TIME",4, 4,"delay cycles of cs pin by spi clock, this bits combined with spi_cs_hold bit."],
		 ["SPI_SETUP_TIME",0,4,"default: 4'h1 ; (cycles-1) of prepare phase by spi clock, this bits combined with spi_cs_setup bit."]
		 ]
		}
	};