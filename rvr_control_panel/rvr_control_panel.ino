/*
14CORE LCD 16x2 Display Driving Example
*/
#include <Wire.h> // Include Wire.h to control I2C
#include <LiquidCrystal_I2C.h> //Download & include the code library can be downloaded below
#include <IRremote.h>

int mode = 0;
int prevMode = 0;
char modeName[16] = {0};

char modes[100][16] = {}; // This reserves 1,600 bytes in the heap, notice that this is a lot
int modeCount = 0;

// Global buffer for serial reading
char serialInput[1024] = {0};

// Command constants
const int ADD_MODE       = 1;
const int SOMETHING_ELSE = 2;

// Button inputs
const int NEXT_BUTTON_PIN = 22;
const int BACK_BUTTON_PIN = 24;
const int PLAY_BUTTON_PIN = 26;
const int FART_BUTTON = 28;

const int IR_RECEIVER_PIN = 32;

const int IR_NEXT = 1;
const int IR_PREV = 2;
const int IR_PLAY = 3;
const int IR_FART = 4;
long ir_value = 0x0;
int ir_option = -1;

const char FART_ANNOUNCEMENTS[6][16] = {"Air monkey!", "Ass blast!", "Bottom burp!", "Brown mist!", "Gluteal tuba!", "Butt music!"};

IRrecv irrecv(IR_RECEIVER_PIN);
decode_results results;

LiquidCrystal_I2C lcd(0x3F,2,1,0,4,5,6,7,3, POSITIVE); // Initialize LCD Display at address 0x3F
void setup()
{
 lcd.begin (16,2);
 Serial.begin(9600);
 pinMode(NEXT_BUTTON_PIN, INPUT);
 pinMode(BACK_BUTTON_PIN, INPUT);
 pinMode(PLAY_BUTTON_PIN, INPUT);
 pinMode(FART_BUTTON, INPUT);
 irrecv.enableIRIn(); // Listen to IR signals
 lcd.setBacklight(HIGH); //Set Back light turn On
 setupScreen(0);
}

void requestModesIfNecessary() {
  if(modeCount == 0) {
    delay(500);
    Serial.println("{\"action\": \"get_modes\"}");
    delay(1500);
  }
}

void setupScreen(int ordinal) {
  lcd.setCursor(0,0);
  lcd.print("Room Theme:    ");
  lcd.print(ordinal);
}

void printNowPlayingScreen(int ordinal) {
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Now playing");
  lcd.setCursor(0,1);
  lcd.print(modes[ordinal]);
  delay(2000);
}

long receiveIR() {
  if (irrecv.decode(&results)){
      const long val = results.value;
      irrecv.resume();
      return val;
  }
  return -1;
}

int decodeIR(long hex) {
  switch(hex) {
    case 0x400555AA: return IR_NEXT;
    case 0x400556A9: return IR_PREV;
    case 0x4005708F: return IR_PLAY;
    case 0x400550AF: return IR_FART;
  }

  return -1;
}

void printOptionScreen(int mode) {
  lcd.clear();
  setupScreen(mode);
  
  lcd.setCursor(0,1);
  lcd.print(modes[mode]);
}

void printFartScreen() {
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print(FART_ANNOUNCEMENTS[random(6)]);
  delay(2500);
}

void processSerialInput() {
  if(!Serial.available()) return;
//  for(int i = 0 ; i < 1024 ; i++)
//    serialInput[i] = 0;
  byte readSize = Serial.readBytesUntil('\n', serialInput, 1024);

  // Split the input into commands and act accordingly
  char* commandInput = strtok(serialInput, ";");
  int commandType = atoi(commandInput);
  commandInput = strtok(NULL, ";");

  switch(commandType) {
    case ADD_MODE:
      modeCount = 0;
      while(commandInput != NULL) {
        if(strlen(commandInput) <= 1) break;
        strcpy(modes[modeCount++], commandInput);
        commandInput = strtok(NULL, ";");
      }
      break;
  }
};

void next() {
      mode += 1;
    delay(150);
}

void prev() {
      mode -= 1;
    delay(150);
}

void play(int mode) {
      Serial.print("{\"action\": \"play\", \"channel\": ");
    Serial.print(mode);
    Serial.println("}");
    printNowPlayingScreen(mode);
    printOptionScreen(mode);
}

void fart(int mode) {
      Serial.print("{\"action\": \"fart\"");
    Serial.println("}");
    printFartScreen();
    printOptionScreen(mode);
}
 
void loop()
{
  ir_option = decodeIR(receiveIR());

  switch(ir_option) {
    case IR_NEXT: next(); break;
    case IR_PREV: prev(); break;
    case IR_PLAY: play(mode); break;
    case IR_FART: fart(mode); break;
  }
  
  if(digitalRead(NEXT_BUTTON_PIN) == HIGH) {
    next();
  } else if(digitalRead(BACK_BUTTON_PIN) == HIGH) {
    prev();
  } else if(digitalRead(PLAY_BUTTON_PIN) == HIGH) {
    play(mode);
  } else if(digitalRead(FART_BUTTON) == HIGH) {
    fart(mode);
  }

  if(mode < 0) mode = modeCount - 1;
  if(mode >= modeCount) mode = 0;

  if(mode != prevMode) {
    printOptionScreen(mode);
    prevMode = mode;
  }

  requestModesIfNecessary();
  processSerialInput();
  delay(50);
}
