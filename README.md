#Tellstick-timer

Acting as a shell to add timer functionality for arokor's tellstick library.
Inspired by and modeled after arkor's module.

##Installation

```bash
$ npm install tellstick-timer
```

##Example

```javascript
var timer = require('tellstick-timer');
ttd = timer();

// addNewTimer(lampId, timerId, onMin, onHour, offMin, offHour, callback);
ttd.addNewTimer(1, 47, 3, 1, 4, 1, function(err, lampId, timerId) {
  if (!err) console.log('Timer added/updated for lamp: ' + lampId + ' with timer ID: ' + timerId);
  if (err) console.log('Could not add timer. ' + err);
});

// removeTImer(lampId, timerId, callback);
ttd.removeTimer(1, 47, function(err, lampId, timerId) {
  if (!err) console.log('Timer removed for lamp: ' + lampId + ' with timer ID: ' + timerId);
  if (err) console.log('Could not remove timer. ' + err);
});
```

##License
The MIT License (MIT)

Copyright (c) 2015 Johan Kitti Söderberg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
