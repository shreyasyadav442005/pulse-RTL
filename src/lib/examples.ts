export const EXAMPLES: Record<string, { label: string; language: string; code: string }> = {
  counter: {
    label: "4-bit Counter (Verilog)",
    language: "verilog",
    code: `module counter_4bit(
  input clk,
  input rst,
  output reg [3:0] count
);
  always @(posedge clk) begin
    if (rst)
      count = 4'b0000;
    else
      count = count + 1;
  end
endmodule`,
  },
  fsm: {
    label: "Traffic FSM (SystemVerilog)",
    language: "systemverilog",
    code: `module traffic_fsm(
  input  logic clk,
  input  logic rst_n,
  output logic [1:0] light
);
  typedef enum logic [1:0] {RED, GREEN, YELLOW} state_t;
  state_t state, next;

  always_ff @(posedge clk or negedge rst_n)
    if (!rst_n) state <= RED;
    else        state <= next;

  always_comb begin
    case (state)
      RED:    next = GREEN;
      GREEN:  next = YELLOW;
      YELLOW: next = RED;
      default: next = RED;
    endcase
  end

  assign light = state;
endmodule`,
  },
  embedded: {
    label: "GPIO Toggle (Embedded C)",
    language: "c",
    code: `#include <stdint.h>
#define GPIO_BASE 0x40020000
#define GPIO_ODR  (*(volatile uint32_t*)(GPIO_BASE + 0x14))

void delay(uint32_t n) {
  while(n--) __asm("nop");
}

int main(void) {
  while (1) {
    GPIO_ODR ^= (1 << 5);
    delay(100000);
  }
}`,
  },
};
