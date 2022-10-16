:loop
call npm run build
call node prod/index.js
goto loop