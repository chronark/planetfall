


async function main() {

    console.time("cold")
    await fetch('https://jsonplaceholder.typicode.com/todos/1', {keepalive: true})
    console.timeEnd("cold")

    await new Promise(resolve => setTimeout(resolve, 1000))
//     console.time("warmup")
//     await fetch('https://jsonplaceholder.typicode.com/todos/1', { keepalive: true })
// console.timeEnd("warmup")

console.time("warm")
await fetch('https://jsonplaceholder.typicode.com/todos/1', { keepalive: true })
console.timeEnd("warm")

}

main()