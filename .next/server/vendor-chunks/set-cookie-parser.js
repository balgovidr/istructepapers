"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/set-cookie-parser";
exports.ids = ["vendor-chunks/set-cookie-parser"];
exports.modules = {

/***/ "(ssr)/./node_modules/set-cookie-parser/lib/set-cookie.js":
/*!**********************************************************!*\
  !*** ./node_modules/set-cookie-parser/lib/set-cookie.js ***!
  \**********************************************************/
/***/ ((module) => {

eval("\nvar defaultParseOptions = {\n    decodeValues: true,\n    map: false,\n    silent: false\n};\nfunction isNonEmptyString(str) {\n    return typeof str === \"string\" && !!str.trim();\n}\nfunction parseString(setCookieValue, options) {\n    var parts = setCookieValue.split(\";\").filter(isNonEmptyString);\n    var nameValuePairStr = parts.shift();\n    var parsed = parseNameValuePair(nameValuePairStr);\n    var name = parsed.name;\n    var value = parsed.value;\n    options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;\n    try {\n        value = options.decodeValues ? decodeURIComponent(value) : value; // decode cookie value\n    } catch (e) {\n        console.error(\"set-cookie-parser encountered an error while decoding a cookie with value '\" + value + \"'. Set options.decodeValues to false to disable this feature.\", e);\n    }\n    var cookie = {\n        name: name,\n        value: value\n    };\n    parts.forEach(function(part) {\n        var sides = part.split(\"=\");\n        var key = sides.shift().trimLeft().toLowerCase();\n        var value = sides.join(\"=\");\n        if (key === \"expires\") {\n            cookie.expires = new Date(value);\n        } else if (key === \"max-age\") {\n            cookie.maxAge = parseInt(value, 10);\n        } else if (key === \"secure\") {\n            cookie.secure = true;\n        } else if (key === \"httponly\") {\n            cookie.httpOnly = true;\n        } else if (key === \"samesite\") {\n            cookie.sameSite = value;\n        } else {\n            cookie[key] = value;\n        }\n    });\n    return cookie;\n}\nfunction parseNameValuePair(nameValuePairStr) {\n    // Parses name-value-pair according to rfc6265bis draft\n    var name = \"\";\n    var value = \"\";\n    var nameValueArr = nameValuePairStr.split(\"=\");\n    if (nameValueArr.length > 1) {\n        name = nameValueArr.shift();\n        value = nameValueArr.join(\"=\"); // everything after the first =, joined by a \"=\" if there was more than one part\n    } else {\n        value = nameValuePairStr;\n    }\n    return {\n        name: name,\n        value: value\n    };\n}\nfunction parse(input, options) {\n    options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;\n    if (!input) {\n        if (!options.map) {\n            return [];\n        } else {\n            return {};\n        }\n    }\n    if (input.headers) {\n        if (typeof input.headers.getSetCookie === \"function\") {\n            // for fetch responses - they combine headers of the same type in the headers array,\n            // but getSetCookie returns an uncombined array\n            input = input.headers.getSetCookie();\n        } else if (input.headers[\"set-cookie\"]) {\n            // fast-path for node.js (which automatically normalizes header names to lower-case\n            input = input.headers[\"set-cookie\"];\n        } else {\n            // slow-path for other environments - see #25\n            var sch = input.headers[Object.keys(input.headers).find(function(key) {\n                return key.toLowerCase() === \"set-cookie\";\n            })];\n            // warn if called on a request-like object with a cookie header rather than a set-cookie header - see #34, 36\n            if (!sch && input.headers.cookie && !options.silent) {\n                console.warn(\"Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning.\");\n            }\n            input = sch;\n        }\n    }\n    if (!Array.isArray(input)) {\n        input = [\n            input\n        ];\n    }\n    options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;\n    if (!options.map) {\n        return input.filter(isNonEmptyString).map(function(str) {\n            return parseString(str, options);\n        });\n    } else {\n        var cookies = {};\n        return input.filter(isNonEmptyString).reduce(function(cookies, str) {\n            var cookie = parseString(str, options);\n            cookies[cookie.name] = cookie;\n            return cookies;\n        }, cookies);\n    }\n}\n/*\n  Set-Cookie header field-values are sometimes comma joined in one string. This splits them without choking on commas\n  that are within a single set-cookie field-value, such as in the Expires portion.\n\n  This is uncommon, but explicitly allowed - see https://tools.ietf.org/html/rfc2616#section-4.2\n  Node.js does this for every header *except* set-cookie - see https://github.com/nodejs/node/blob/d5e363b77ebaf1caf67cd7528224b651c86815c1/lib/_http_incoming.js#L128\n  React Native's fetch does this for *every* header, including set-cookie.\n\n  Based on: https://github.com/google/j2objc/commit/16820fdbc8f76ca0c33472810ce0cb03d20efe25\n  Credits to: https://github.com/tomball for original and https://github.com/chrusart for JavaScript implementation\n*/ function splitCookiesString(cookiesString) {\n    if (Array.isArray(cookiesString)) {\n        return cookiesString;\n    }\n    if (typeof cookiesString !== \"string\") {\n        return [];\n    }\n    var cookiesStrings = [];\n    var pos = 0;\n    var start;\n    var ch;\n    var lastComma;\n    var nextStart;\n    var cookiesSeparatorFound;\n    function skipWhitespace() {\n        while(pos < cookiesString.length && /\\s/.test(cookiesString.charAt(pos))){\n            pos += 1;\n        }\n        return pos < cookiesString.length;\n    }\n    function notSpecialChar() {\n        ch = cookiesString.charAt(pos);\n        return ch !== \"=\" && ch !== \";\" && ch !== \",\";\n    }\n    while(pos < cookiesString.length){\n        start = pos;\n        cookiesSeparatorFound = false;\n        while(skipWhitespace()){\n            ch = cookiesString.charAt(pos);\n            if (ch === \",\") {\n                // ',' is a cookie separator if we have later first '=', not ';' or ','\n                lastComma = pos;\n                pos += 1;\n                skipWhitespace();\n                nextStart = pos;\n                while(pos < cookiesString.length && notSpecialChar()){\n                    pos += 1;\n                }\n                // currently special character\n                if (pos < cookiesString.length && cookiesString.charAt(pos) === \"=\") {\n                    // we found cookies separator\n                    cookiesSeparatorFound = true;\n                    // pos is inside the next cookie, so back up and return it.\n                    pos = nextStart;\n                    cookiesStrings.push(cookiesString.substring(start, lastComma));\n                    start = pos;\n                } else {\n                    // in param ',' or param separator ';',\n                    // we continue from that comma\n                    pos = lastComma + 1;\n                }\n            } else {\n                pos += 1;\n            }\n        }\n        if (!cookiesSeparatorFound || pos >= cookiesString.length) {\n            cookiesStrings.push(cookiesString.substring(start, cookiesString.length));\n        }\n    }\n    return cookiesStrings;\n}\nmodule.exports = parse;\nmodule.exports.parse = parse;\nmodule.exports.parseString = parseString;\nmodule.exports.splitCookiesString = splitCookiesString;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvc2V0LWNvb2tpZS1wYXJzZXIvbGliL3NldC1jb29raWUuanMiLCJtYXBwaW5ncyI6IkFBQWE7QUFFYixJQUFJQSxzQkFBc0I7SUFDeEJDLGNBQWM7SUFDZEMsS0FBSztJQUNMQyxRQUFRO0FBQ1Y7QUFFQSxTQUFTQyxpQkFBaUJDLEdBQUc7SUFDM0IsT0FBTyxPQUFPQSxRQUFRLFlBQVksQ0FBQyxDQUFDQSxJQUFJQyxJQUFJO0FBQzlDO0FBRUEsU0FBU0MsWUFBWUMsY0FBYyxFQUFFQyxPQUFPO0lBQzFDLElBQUlDLFFBQVFGLGVBQWVHLEtBQUssQ0FBQyxLQUFLQyxNQUFNLENBQUNSO0lBRTdDLElBQUlTLG1CQUFtQkgsTUFBTUksS0FBSztJQUNsQyxJQUFJQyxTQUFTQyxtQkFBbUJIO0lBQ2hDLElBQUlJLE9BQU9GLE9BQU9FLElBQUk7SUFDdEIsSUFBSUMsUUFBUUgsT0FBT0csS0FBSztJQUV4QlQsVUFBVUEsVUFDTlUsT0FBT0MsTUFBTSxDQUFDLENBQUMsR0FBR3BCLHFCQUFxQlMsV0FDdkNUO0lBRUosSUFBSTtRQUNGa0IsUUFBUVQsUUFBUVIsWUFBWSxHQUFHb0IsbUJBQW1CSCxTQUFTQSxPQUFPLHNCQUFzQjtJQUMxRixFQUFFLE9BQU9JLEdBQUc7UUFDVkMsUUFBUUMsS0FBSyxDQUNYLGdGQUNFTixRQUNBLGlFQUNGSTtJQUVKO0lBRUEsSUFBSUcsU0FBUztRQUNYUixNQUFNQTtRQUNOQyxPQUFPQTtJQUNUO0lBRUFSLE1BQU1nQixPQUFPLENBQUMsU0FBVUMsSUFBSTtRQUMxQixJQUFJQyxRQUFRRCxLQUFLaEIsS0FBSyxDQUFDO1FBQ3ZCLElBQUlrQixNQUFNRCxNQUFNZCxLQUFLLEdBQUdnQixRQUFRLEdBQUdDLFdBQVc7UUFDOUMsSUFBSWIsUUFBUVUsTUFBTUksSUFBSSxDQUFDO1FBQ3ZCLElBQUlILFFBQVEsV0FBVztZQUNyQkosT0FBT1EsT0FBTyxHQUFHLElBQUlDLEtBQUtoQjtRQUM1QixPQUFPLElBQUlXLFFBQVEsV0FBVztZQUM1QkosT0FBT1UsTUFBTSxHQUFHQyxTQUFTbEIsT0FBTztRQUNsQyxPQUFPLElBQUlXLFFBQVEsVUFBVTtZQUMzQkosT0FBT1ksTUFBTSxHQUFHO1FBQ2xCLE9BQU8sSUFBSVIsUUFBUSxZQUFZO1lBQzdCSixPQUFPYSxRQUFRLEdBQUc7UUFDcEIsT0FBTyxJQUFJVCxRQUFRLFlBQVk7WUFDN0JKLE9BQU9jLFFBQVEsR0FBR3JCO1FBQ3BCLE9BQU87WUFDTE8sTUFBTSxDQUFDSSxJQUFJLEdBQUdYO1FBQ2hCO0lBQ0Y7SUFFQSxPQUFPTztBQUNUO0FBRUEsU0FBU1QsbUJBQW1CSCxnQkFBZ0I7SUFDMUMsdURBQXVEO0lBRXZELElBQUlJLE9BQU87SUFDWCxJQUFJQyxRQUFRO0lBQ1osSUFBSXNCLGVBQWUzQixpQkFBaUJGLEtBQUssQ0FBQztJQUMxQyxJQUFJNkIsYUFBYUMsTUFBTSxHQUFHLEdBQUc7UUFDM0J4QixPQUFPdUIsYUFBYTFCLEtBQUs7UUFDekJJLFFBQVFzQixhQUFhUixJQUFJLENBQUMsTUFBTSxnRkFBZ0Y7SUFDbEgsT0FBTztRQUNMZCxRQUFRTDtJQUNWO0lBRUEsT0FBTztRQUFFSSxNQUFNQTtRQUFNQyxPQUFPQTtJQUFNO0FBQ3BDO0FBRUEsU0FBU3dCLE1BQU1DLEtBQUssRUFBRWxDLE9BQU87SUFDM0JBLFVBQVVBLFVBQ05VLE9BQU9DLE1BQU0sQ0FBQyxDQUFDLEdBQUdwQixxQkFBcUJTLFdBQ3ZDVDtJQUVKLElBQUksQ0FBQzJDLE9BQU87UUFDVixJQUFJLENBQUNsQyxRQUFRUCxHQUFHLEVBQUU7WUFDaEIsT0FBTyxFQUFFO1FBQ1gsT0FBTztZQUNMLE9BQU8sQ0FBQztRQUNWO0lBQ0Y7SUFFQSxJQUFJeUMsTUFBTUMsT0FBTyxFQUFFO1FBQ2pCLElBQUksT0FBT0QsTUFBTUMsT0FBTyxDQUFDQyxZQUFZLEtBQUssWUFBWTtZQUNwRCxvRkFBb0Y7WUFDcEYsK0NBQStDO1lBQy9DRixRQUFRQSxNQUFNQyxPQUFPLENBQUNDLFlBQVk7UUFDcEMsT0FBTyxJQUFJRixNQUFNQyxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQ3RDLG1GQUFtRjtZQUNuRkQsUUFBUUEsTUFBTUMsT0FBTyxDQUFDLGFBQWE7UUFDckMsT0FBTztZQUNMLDZDQUE2QztZQUM3QyxJQUFJRSxNQUNGSCxNQUFNQyxPQUFPLENBQ1h6QixPQUFPNEIsSUFBSSxDQUFDSixNQUFNQyxPQUFPLEVBQUVJLElBQUksQ0FBQyxTQUFVbkIsR0FBRztnQkFDM0MsT0FBT0EsSUFBSUUsV0FBVyxPQUFPO1lBQy9CLEdBQ0Q7WUFDSCw2R0FBNkc7WUFDN0csSUFBSSxDQUFDZSxPQUFPSCxNQUFNQyxPQUFPLENBQUNuQixNQUFNLElBQUksQ0FBQ2hCLFFBQVFOLE1BQU0sRUFBRTtnQkFDbkRvQixRQUFRMEIsSUFBSSxDQUNWO1lBRUo7WUFDQU4sUUFBUUc7UUFDVjtJQUNGO0lBQ0EsSUFBSSxDQUFDSSxNQUFNQyxPQUFPLENBQUNSLFFBQVE7UUFDekJBLFFBQVE7WUFBQ0E7U0FBTTtJQUNqQjtJQUVBbEMsVUFBVUEsVUFDTlUsT0FBT0MsTUFBTSxDQUFDLENBQUMsR0FBR3BCLHFCQUFxQlMsV0FDdkNUO0lBRUosSUFBSSxDQUFDUyxRQUFRUCxHQUFHLEVBQUU7UUFDaEIsT0FBT3lDLE1BQU0vQixNQUFNLENBQUNSLGtCQUFrQkYsR0FBRyxDQUFDLFNBQVVHLEdBQUc7WUFDckQsT0FBT0UsWUFBWUYsS0FBS0k7UUFDMUI7SUFDRixPQUFPO1FBQ0wsSUFBSTJDLFVBQVUsQ0FBQztRQUNmLE9BQU9ULE1BQU0vQixNQUFNLENBQUNSLGtCQUFrQmlELE1BQU0sQ0FBQyxTQUFVRCxPQUFPLEVBQUUvQyxHQUFHO1lBQ2pFLElBQUlvQixTQUFTbEIsWUFBWUYsS0FBS0k7WUFDOUIyQyxPQUFPLENBQUMzQixPQUFPUixJQUFJLENBQUMsR0FBR1E7WUFDdkIsT0FBTzJCO1FBQ1QsR0FBR0E7SUFDTDtBQUNGO0FBRUE7Ozs7Ozs7Ozs7QUFVQSxHQUNBLFNBQVNFLG1CQUFtQkMsYUFBYTtJQUN2QyxJQUFJTCxNQUFNQyxPQUFPLENBQUNJLGdCQUFnQjtRQUNoQyxPQUFPQTtJQUNUO0lBQ0EsSUFBSSxPQUFPQSxrQkFBa0IsVUFBVTtRQUNyQyxPQUFPLEVBQUU7SUFDWDtJQUVBLElBQUlDLGlCQUFpQixFQUFFO0lBQ3ZCLElBQUlDLE1BQU07SUFDVixJQUFJQztJQUNKLElBQUlDO0lBQ0osSUFBSUM7SUFDSixJQUFJQztJQUNKLElBQUlDO0lBRUosU0FBU0M7UUFDUCxNQUFPTixNQUFNRixjQUFjZCxNQUFNLElBQUksS0FBS3VCLElBQUksQ0FBQ1QsY0FBY1UsTUFBTSxDQUFDUixNQUFPO1lBQ3pFQSxPQUFPO1FBQ1Q7UUFDQSxPQUFPQSxNQUFNRixjQUFjZCxNQUFNO0lBQ25DO0lBRUEsU0FBU3lCO1FBQ1BQLEtBQUtKLGNBQWNVLE1BQU0sQ0FBQ1I7UUFFMUIsT0FBT0UsT0FBTyxPQUFPQSxPQUFPLE9BQU9BLE9BQU87SUFDNUM7SUFFQSxNQUFPRixNQUFNRixjQUFjZCxNQUFNLENBQUU7UUFDakNpQixRQUFRRDtRQUNSSyx3QkFBd0I7UUFFeEIsTUFBT0MsaUJBQWtCO1lBQ3ZCSixLQUFLSixjQUFjVSxNQUFNLENBQUNSO1lBQzFCLElBQUlFLE9BQU8sS0FBSztnQkFDZCx1RUFBdUU7Z0JBQ3ZFQyxZQUFZSDtnQkFDWkEsT0FBTztnQkFFUE07Z0JBQ0FGLFlBQVlKO2dCQUVaLE1BQU9BLE1BQU1GLGNBQWNkLE1BQU0sSUFBSXlCLGlCQUFrQjtvQkFDckRULE9BQU87Z0JBQ1Q7Z0JBRUEsOEJBQThCO2dCQUM5QixJQUFJQSxNQUFNRixjQUFjZCxNQUFNLElBQUljLGNBQWNVLE1BQU0sQ0FBQ1IsU0FBUyxLQUFLO29CQUNuRSw2QkFBNkI7b0JBQzdCSyx3QkFBd0I7b0JBQ3hCLDJEQUEyRDtvQkFDM0RMLE1BQU1JO29CQUNOTCxlQUFlVyxJQUFJLENBQUNaLGNBQWNhLFNBQVMsQ0FBQ1YsT0FBT0U7b0JBQ25ERixRQUFRRDtnQkFDVixPQUFPO29CQUNMLHVDQUF1QztvQkFDdkMsOEJBQThCO29CQUM5QkEsTUFBTUcsWUFBWTtnQkFDcEI7WUFDRixPQUFPO2dCQUNMSCxPQUFPO1lBQ1Q7UUFDRjtRQUVBLElBQUksQ0FBQ0sseUJBQXlCTCxPQUFPRixjQUFjZCxNQUFNLEVBQUU7WUFDekRlLGVBQWVXLElBQUksQ0FBQ1osY0FBY2EsU0FBUyxDQUFDVixPQUFPSCxjQUFjZCxNQUFNO1FBQ3pFO0lBQ0Y7SUFFQSxPQUFPZTtBQUNUO0FBRUFhLE9BQU9DLE9BQU8sR0FBRzVCO0FBQ2pCMkIsb0JBQW9CLEdBQUczQjtBQUN2QjJCLDBCQUEwQixHQUFHOUQ7QUFDN0I4RCxpQ0FBaUMsR0FBR2YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9pc3RydWN0ZXBhcGVyc192Mi8uL25vZGVfbW9kdWxlcy9zZXQtY29va2llLXBhcnNlci9saWIvc2V0LWNvb2tpZS5qcz8zMzEzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZGVmYXVsdFBhcnNlT3B0aW9ucyA9IHtcbiAgZGVjb2RlVmFsdWVzOiB0cnVlLFxuICBtYXA6IGZhbHNlLFxuICBzaWxlbnQ6IGZhbHNlLFxufTtcblxuZnVuY3Rpb24gaXNOb25FbXB0eVN0cmluZyhzdHIpIHtcbiAgcmV0dXJuIHR5cGVvZiBzdHIgPT09IFwic3RyaW5nXCIgJiYgISFzdHIudHJpbSgpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzZXRDb29raWVWYWx1ZSwgb3B0aW9ucykge1xuICB2YXIgcGFydHMgPSBzZXRDb29raWVWYWx1ZS5zcGxpdChcIjtcIikuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpO1xuXG4gIHZhciBuYW1lVmFsdWVQYWlyU3RyID0gcGFydHMuc2hpZnQoKTtcbiAgdmFyIHBhcnNlZCA9IHBhcnNlTmFtZVZhbHVlUGFpcihuYW1lVmFsdWVQYWlyU3RyKTtcbiAgdmFyIG5hbWUgPSBwYXJzZWQubmFtZTtcbiAgdmFyIHZhbHVlID0gcGFyc2VkLnZhbHVlO1xuXG4gIG9wdGlvbnMgPSBvcHRpb25zXG4gICAgPyBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UGFyc2VPcHRpb25zLCBvcHRpb25zKVxuICAgIDogZGVmYXVsdFBhcnNlT3B0aW9ucztcblxuICB0cnkge1xuICAgIHZhbHVlID0gb3B0aW9ucy5kZWNvZGVWYWx1ZXMgPyBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpIDogdmFsdWU7IC8vIGRlY29kZSBjb29raWUgdmFsdWVcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICBcInNldC1jb29raWUtcGFyc2VyIGVuY291bnRlcmVkIGFuIGVycm9yIHdoaWxlIGRlY29kaW5nIGEgY29va2llIHdpdGggdmFsdWUgJ1wiICtcbiAgICAgICAgdmFsdWUgK1xuICAgICAgICBcIicuIFNldCBvcHRpb25zLmRlY29kZVZhbHVlcyB0byBmYWxzZSB0byBkaXNhYmxlIHRoaXMgZmVhdHVyZS5cIixcbiAgICAgIGVcbiAgICApO1xuICB9XG5cbiAgdmFyIGNvb2tpZSA9IHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgfTtcblxuICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgdmFyIHNpZGVzID0gcGFydC5zcGxpdChcIj1cIik7XG4gICAgdmFyIGtleSA9IHNpZGVzLnNoaWZ0KCkudHJpbUxlZnQoKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhciB2YWx1ZSA9IHNpZGVzLmpvaW4oXCI9XCIpO1xuICAgIGlmIChrZXkgPT09IFwiZXhwaXJlc1wiKSB7XG4gICAgICBjb29raWUuZXhwaXJlcyA9IG5ldyBEYXRlKHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJtYXgtYWdlXCIpIHtcbiAgICAgIGNvb2tpZS5tYXhBZ2UgPSBwYXJzZUludCh2YWx1ZSwgMTApO1xuICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcInNlY3VyZVwiKSB7XG4gICAgICBjb29raWUuc2VjdXJlID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJodHRwb25seVwiKSB7XG4gICAgICBjb29raWUuaHR0cE9ubHkgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcInNhbWVzaXRlXCIpIHtcbiAgICAgIGNvb2tpZS5zYW1lU2l0ZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb29raWVba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNvb2tpZTtcbn1cblxuZnVuY3Rpb24gcGFyc2VOYW1lVmFsdWVQYWlyKG5hbWVWYWx1ZVBhaXJTdHIpIHtcbiAgLy8gUGFyc2VzIG5hbWUtdmFsdWUtcGFpciBhY2NvcmRpbmcgdG8gcmZjNjI2NWJpcyBkcmFmdFxuXG4gIHZhciBuYW1lID0gXCJcIjtcbiAgdmFyIHZhbHVlID0gXCJcIjtcbiAgdmFyIG5hbWVWYWx1ZUFyciA9IG5hbWVWYWx1ZVBhaXJTdHIuc3BsaXQoXCI9XCIpO1xuICBpZiAobmFtZVZhbHVlQXJyLmxlbmd0aCA+IDEpIHtcbiAgICBuYW1lID0gbmFtZVZhbHVlQXJyLnNoaWZ0KCk7XG4gICAgdmFsdWUgPSBuYW1lVmFsdWVBcnIuam9pbihcIj1cIik7IC8vIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIGZpcnN0ID0sIGpvaW5lZCBieSBhIFwiPVwiIGlmIHRoZXJlIHdhcyBtb3JlIHRoYW4gb25lIHBhcnRcbiAgfSBlbHNlIHtcbiAgICB2YWx1ZSA9IG5hbWVWYWx1ZVBhaXJTdHI7XG4gIH1cblxuICByZXR1cm4geyBuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWUgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoaW5wdXQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnNcbiAgICA/IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQYXJzZU9wdGlvbnMsIG9wdGlvbnMpXG4gICAgOiBkZWZhdWx0UGFyc2VPcHRpb25zO1xuXG4gIGlmICghaW5wdXQpIHtcbiAgICBpZiAoIW9wdGlvbnMubWFwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICBpZiAoaW5wdXQuaGVhZGVycykge1xuICAgIGlmICh0eXBlb2YgaW5wdXQuaGVhZGVycy5nZXRTZXRDb29raWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gZm9yIGZldGNoIHJlc3BvbnNlcyAtIHRoZXkgY29tYmluZSBoZWFkZXJzIG9mIHRoZSBzYW1lIHR5cGUgaW4gdGhlIGhlYWRlcnMgYXJyYXksXG4gICAgICAvLyBidXQgZ2V0U2V0Q29va2llIHJldHVybnMgYW4gdW5jb21iaW5lZCBhcnJheVxuICAgICAgaW5wdXQgPSBpbnB1dC5oZWFkZXJzLmdldFNldENvb2tpZSgpO1xuICAgIH0gZWxzZSBpZiAoaW5wdXQuaGVhZGVyc1tcInNldC1jb29raWVcIl0pIHtcbiAgICAgIC8vIGZhc3QtcGF0aCBmb3Igbm9kZS5qcyAod2hpY2ggYXV0b21hdGljYWxseSBub3JtYWxpemVzIGhlYWRlciBuYW1lcyB0byBsb3dlci1jYXNlXG4gICAgICBpbnB1dCA9IGlucHV0LmhlYWRlcnNbXCJzZXQtY29va2llXCJdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzbG93LXBhdGggZm9yIG90aGVyIGVudmlyb25tZW50cyAtIHNlZSAjMjVcbiAgICAgIHZhciBzY2ggPVxuICAgICAgICBpbnB1dC5oZWFkZXJzW1xuICAgICAgICAgIE9iamVjdC5rZXlzKGlucHV0LmhlYWRlcnMpLmZpbmQoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGtleS50b0xvd2VyQ2FzZSgpID09PSBcInNldC1jb29raWVcIjtcbiAgICAgICAgICB9KVxuICAgICAgICBdO1xuICAgICAgLy8gd2FybiBpZiBjYWxsZWQgb24gYSByZXF1ZXN0LWxpa2Ugb2JqZWN0IHdpdGggYSBjb29raWUgaGVhZGVyIHJhdGhlciB0aGFuIGEgc2V0LWNvb2tpZSBoZWFkZXIgLSBzZWUgIzM0LCAzNlxuICAgICAgaWYgKCFzY2ggJiYgaW5wdXQuaGVhZGVycy5jb29raWUgJiYgIW9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBcIldhcm5pbmc6IHNldC1jb29raWUtcGFyc2VyIGFwcGVhcnMgdG8gaGF2ZSBiZWVuIGNhbGxlZCBvbiBhIHJlcXVlc3Qgb2JqZWN0LiBJdCBpcyBkZXNpZ25lZCB0byBwYXJzZSBTZXQtQ29va2llIGhlYWRlcnMgZnJvbSByZXNwb25zZXMsIG5vdCBDb29raWUgaGVhZGVycyBmcm9tIHJlcXVlc3RzLiBTZXQgdGhlIG9wdGlvbiB7c2lsZW50OiB0cnVlfSB0byBzdXBwcmVzcyB0aGlzIHdhcm5pbmcuXCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlucHV0ID0gc2NoO1xuICAgIH1cbiAgfVxuICBpZiAoIUFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG4gICAgaW5wdXQgPSBbaW5wdXRdO1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnNcbiAgICA/IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQYXJzZU9wdGlvbnMsIG9wdGlvbnMpXG4gICAgOiBkZWZhdWx0UGFyc2VPcHRpb25zO1xuXG4gIGlmICghb3B0aW9ucy5tYXApIHtcbiAgICByZXR1cm4gaW5wdXQuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpLm1hcChmdW5jdGlvbiAoc3RyKSB7XG4gICAgICByZXR1cm4gcGFyc2VTdHJpbmcoc3RyLCBvcHRpb25zKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgY29va2llcyA9IHt9O1xuICAgIHJldHVybiBpbnB1dC5maWx0ZXIoaXNOb25FbXB0eVN0cmluZykucmVkdWNlKGZ1bmN0aW9uIChjb29raWVzLCBzdHIpIHtcbiAgICAgIHZhciBjb29raWUgPSBwYXJzZVN0cmluZyhzdHIsIG9wdGlvbnMpO1xuICAgICAgY29va2llc1tjb29raWUubmFtZV0gPSBjb29raWU7XG4gICAgICByZXR1cm4gY29va2llcztcbiAgICB9LCBjb29raWVzKTtcbiAgfVxufVxuXG4vKlxuICBTZXQtQ29va2llIGhlYWRlciBmaWVsZC12YWx1ZXMgYXJlIHNvbWV0aW1lcyBjb21tYSBqb2luZWQgaW4gb25lIHN0cmluZy4gVGhpcyBzcGxpdHMgdGhlbSB3aXRob3V0IGNob2tpbmcgb24gY29tbWFzXG4gIHRoYXQgYXJlIHdpdGhpbiBhIHNpbmdsZSBzZXQtY29va2llIGZpZWxkLXZhbHVlLCBzdWNoIGFzIGluIHRoZSBFeHBpcmVzIHBvcnRpb24uXG5cbiAgVGhpcyBpcyB1bmNvbW1vbiwgYnV0IGV4cGxpY2l0bHkgYWxsb3dlZCAtIHNlZSBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjYxNiNzZWN0aW9uLTQuMlxuICBOb2RlLmpzIGRvZXMgdGhpcyBmb3IgZXZlcnkgaGVhZGVyICpleGNlcHQqIHNldC1jb29raWUgLSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvZDVlMzYzYjc3ZWJhZjFjYWY2N2NkNzUyODIyNGI2NTFjODY4MTVjMS9saWIvX2h0dHBfaW5jb21pbmcuanMjTDEyOFxuICBSZWFjdCBOYXRpdmUncyBmZXRjaCBkb2VzIHRoaXMgZm9yICpldmVyeSogaGVhZGVyLCBpbmNsdWRpbmcgc2V0LWNvb2tpZS5cblxuICBCYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9qMm9iamMvY29tbWl0LzE2ODIwZmRiYzhmNzZjYTBjMzM0NzI4MTBjZTBjYjAzZDIwZWZlMjVcbiAgQ3JlZGl0cyB0bzogaHR0cHM6Ly9naXRodWIuY29tL3RvbWJhbGwgZm9yIG9yaWdpbmFsIGFuZCBodHRwczovL2dpdGh1Yi5jb20vY2hydXNhcnQgZm9yIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb25cbiovXG5mdW5jdGlvbiBzcGxpdENvb2tpZXNTdHJpbmcoY29va2llc1N0cmluZykge1xuICBpZiAoQXJyYXkuaXNBcnJheShjb29raWVzU3RyaW5nKSkge1xuICAgIHJldHVybiBjb29raWVzU3RyaW5nO1xuICB9XG4gIGlmICh0eXBlb2YgY29va2llc1N0cmluZyAhPT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHZhciBjb29raWVzU3RyaW5ncyA9IFtdO1xuICB2YXIgcG9zID0gMDtcbiAgdmFyIHN0YXJ0O1xuICB2YXIgY2g7XG4gIHZhciBsYXN0Q29tbWE7XG4gIHZhciBuZXh0U3RhcnQ7XG4gIHZhciBjb29raWVzU2VwYXJhdG9yRm91bmQ7XG5cbiAgZnVuY3Rpb24gc2tpcFdoaXRlc3BhY2UoKSB7XG4gICAgd2hpbGUgKHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoICYmIC9cXHMvLnRlc3QoY29va2llc1N0cmluZy5jaGFyQXQocG9zKSkpIHtcbiAgICAgIHBvcyArPSAxO1xuICAgIH1cbiAgICByZXR1cm4gcG9zIDwgY29va2llc1N0cmluZy5sZW5ndGg7XG4gIH1cblxuICBmdW5jdGlvbiBub3RTcGVjaWFsQ2hhcigpIHtcbiAgICBjaCA9IGNvb2tpZXNTdHJpbmcuY2hhckF0KHBvcyk7XG5cbiAgICByZXR1cm4gY2ggIT09IFwiPVwiICYmIGNoICE9PSBcIjtcIiAmJiBjaCAhPT0gXCIsXCI7XG4gIH1cblxuICB3aGlsZSAocG9zIDwgY29va2llc1N0cmluZy5sZW5ndGgpIHtcbiAgICBzdGFydCA9IHBvcztcbiAgICBjb29raWVzU2VwYXJhdG9yRm91bmQgPSBmYWxzZTtcblxuICAgIHdoaWxlIChza2lwV2hpdGVzcGFjZSgpKSB7XG4gICAgICBjaCA9IGNvb2tpZXNTdHJpbmcuY2hhckF0KHBvcyk7XG4gICAgICBpZiAoY2ggPT09IFwiLFwiKSB7XG4gICAgICAgIC8vICcsJyBpcyBhIGNvb2tpZSBzZXBhcmF0b3IgaWYgd2UgaGF2ZSBsYXRlciBmaXJzdCAnPScsIG5vdCAnOycgb3IgJywnXG4gICAgICAgIGxhc3RDb21tYSA9IHBvcztcbiAgICAgICAgcG9zICs9IDE7XG5cbiAgICAgICAgc2tpcFdoaXRlc3BhY2UoKTtcbiAgICAgICAgbmV4dFN0YXJ0ID0gcG9zO1xuXG4gICAgICAgIHdoaWxlIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCAmJiBub3RTcGVjaWFsQ2hhcigpKSB7XG4gICAgICAgICAgcG9zICs9IDE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjdXJyZW50bHkgc3BlY2lhbCBjaGFyYWN0ZXJcbiAgICAgICAgaWYgKHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoICYmIGNvb2tpZXNTdHJpbmcuY2hhckF0KHBvcykgPT09IFwiPVwiKSB7XG4gICAgICAgICAgLy8gd2UgZm91bmQgY29va2llcyBzZXBhcmF0b3JcbiAgICAgICAgICBjb29raWVzU2VwYXJhdG9yRm91bmQgPSB0cnVlO1xuICAgICAgICAgIC8vIHBvcyBpcyBpbnNpZGUgdGhlIG5leHQgY29va2llLCBzbyBiYWNrIHVwIGFuZCByZXR1cm4gaXQuXG4gICAgICAgICAgcG9zID0gbmV4dFN0YXJ0O1xuICAgICAgICAgIGNvb2tpZXNTdHJpbmdzLnB1c2goY29va2llc1N0cmluZy5zdWJzdHJpbmcoc3RhcnQsIGxhc3RDb21tYSkpO1xuICAgICAgICAgIHN0YXJ0ID0gcG9zO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGluIHBhcmFtICcsJyBvciBwYXJhbSBzZXBhcmF0b3IgJzsnLFxuICAgICAgICAgIC8vIHdlIGNvbnRpbnVlIGZyb20gdGhhdCBjb21tYVxuICAgICAgICAgIHBvcyA9IGxhc3RDb21tYSArIDE7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvcyArPSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghY29va2llc1NlcGFyYXRvckZvdW5kIHx8IHBvcyA+PSBjb29raWVzU3RyaW5nLmxlbmd0aCkge1xuICAgICAgY29va2llc1N0cmluZ3MucHVzaChjb29raWVzU3RyaW5nLnN1YnN0cmluZyhzdGFydCwgY29va2llc1N0cmluZy5sZW5ndGgpKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29va2llc1N0cmluZ3M7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG5tb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xubW9kdWxlLmV4cG9ydHMucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcbm1vZHVsZS5leHBvcnRzLnNwbGl0Q29va2llc1N0cmluZyA9IHNwbGl0Q29va2llc1N0cmluZztcbiJdLCJuYW1lcyI6WyJkZWZhdWx0UGFyc2VPcHRpb25zIiwiZGVjb2RlVmFsdWVzIiwibWFwIiwic2lsZW50IiwiaXNOb25FbXB0eVN0cmluZyIsInN0ciIsInRyaW0iLCJwYXJzZVN0cmluZyIsInNldENvb2tpZVZhbHVlIiwib3B0aW9ucyIsInBhcnRzIiwic3BsaXQiLCJmaWx0ZXIiLCJuYW1lVmFsdWVQYWlyU3RyIiwic2hpZnQiLCJwYXJzZWQiLCJwYXJzZU5hbWVWYWx1ZVBhaXIiLCJuYW1lIiwidmFsdWUiLCJPYmplY3QiLCJhc3NpZ24iLCJkZWNvZGVVUklDb21wb25lbnQiLCJlIiwiY29uc29sZSIsImVycm9yIiwiY29va2llIiwiZm9yRWFjaCIsInBhcnQiLCJzaWRlcyIsImtleSIsInRyaW1MZWZ0IiwidG9Mb3dlckNhc2UiLCJqb2luIiwiZXhwaXJlcyIsIkRhdGUiLCJtYXhBZ2UiLCJwYXJzZUludCIsInNlY3VyZSIsImh0dHBPbmx5Iiwic2FtZVNpdGUiLCJuYW1lVmFsdWVBcnIiLCJsZW5ndGgiLCJwYXJzZSIsImlucHV0IiwiaGVhZGVycyIsImdldFNldENvb2tpZSIsInNjaCIsImtleXMiLCJmaW5kIiwid2FybiIsIkFycmF5IiwiaXNBcnJheSIsImNvb2tpZXMiLCJyZWR1Y2UiLCJzcGxpdENvb2tpZXNTdHJpbmciLCJjb29raWVzU3RyaW5nIiwiY29va2llc1N0cmluZ3MiLCJwb3MiLCJzdGFydCIsImNoIiwibGFzdENvbW1hIiwibmV4dFN0YXJ0IiwiY29va2llc1NlcGFyYXRvckZvdW5kIiwic2tpcFdoaXRlc3BhY2UiLCJ0ZXN0IiwiY2hhckF0Iiwibm90U3BlY2lhbENoYXIiLCJwdXNoIiwic3Vic3RyaW5nIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/set-cookie-parser/lib/set-cookie.js\n");

/***/ })

};
;