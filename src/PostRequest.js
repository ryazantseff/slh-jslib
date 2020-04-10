import { map, tap } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

const PostRequest = ({
    url = 'localhost',
    data = {},
    pipe = [
        map(i => i.response),
        tap(i => console.log(i))
    ]
} = {}) => ajax({
    url: url,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: {...data}
}).pipe(...pipe)

export default PostRequest