This just removes an unecessary HTML file from extension source and
build. If needed, browser will generate a background page automatically.

This change is a tiny refactor which just removes an extra file. It does not change anything in terms of functonality of the extension because browsers automatically generate a placeholder background page if needed. E.g., if you open backgound page in Chrome dev tools, you'll see this:
```
<!DOCTYPE html>
<html><head></head><body>
<script src="background/index.js"></script>
</body></html>
```
Which is pretty much identical to current contents of [src/background/index.html](https://github.com/darkreader/darkreader/blob/master/src/background/index.html)

# Tests
Tested manually (built extension, loaded it, and pressed various buttons to make sure everything still works).
