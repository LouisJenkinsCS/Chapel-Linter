// Common mistake: forgetting to add type to variable
var untypedVar;

for i in 1 .. 100 do
  writeln(i);

  // Common mistake: 'do' only captures a single instruction
  // hence 'i' is out of scope...
  if i % 10 == 0 then
    writeln("Divisible by 10");
