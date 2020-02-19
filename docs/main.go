package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
)

func main() {
	dir,_ := os.Getwd()
	fmt.Println(dir)

	address := flag.String("address","127.0.0.1","监听地址")
	port := flag.Int("port",10086,"端口号")
	flag.Parse()

	fmt.Println(fmt.Sprintf("Hello,zerosbooks %s:%d",*address,*port))
	http.Handle("/", http.FileServer(http.Dir(dir)))
	http.ListenAndServe(fmt.Sprintf("%s:%d",*address,*port), nil)
}