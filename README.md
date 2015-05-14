#Induction
利用java的javascript引擎来工作。
目的
----
    1.更容易的处理数据
    2.更容易调试

问题
-----
不同版本的js引擎略有不同。需要考虑兼容性，目前已知的有：Nashorn引擎更贴近与java本身，直接引用java对象比较容易，但操作的方式更类似于java，不能用apply和call来调用java对象的方法，js对象没有问题。

1.6的js引擎没有JSON对象。同时，1.6的JS引擎有可能会有些类库不支持，比如momentJS


工作原理
=======

核心
-----
我们认定某一个JS是入口，该JS有一个execute方法。系统会为这个入口分配一个独立的JS引擎，这么做是处于健壮性的考虑，把JS引擎和任务绑定在一起，如果某一次任务失败了，导致引擎挂掉，那么不会影响其他的任务进行。而这个任务本身也很容易重新启动。其实它本质上就是为web而设计的，特别是RESTful的服务。每一次的请求其实都在一个独立的JS引擎中处理。但是引擎中的java元素是公用的，比如spring的jdbcTemplate对象，或者其他的java对象。系统其实会缓存这些JS引擎，这样不会每次请求都去加载引擎以及引擎相关的JS。目前其实还没有设计一个好的恢复机制，假如某个任务的JS引擎挂掉了，目前是不可能恢复的。需要注意的是这个execute方法，必须返回一个js的对象，否则系统会报错。。。

加载JS
------
JS对于java来说其实是当作配置文件被加载的。根据约定，我们把这些JS放到类路径下的js文件夹中。系统首先会加载Base.js以及一些全局的lib文件。Base.js是非常重要的，其中定义了命名空间，以及一些全局变量，依赖这些全局变量，js得以和java进行交互。目前js和java仅仅通过对象调用以及JSON字符串进行交互。被加载的js文件是不会被不断的加载的，系统会判断它的修改时间，只有最新的js会被重新的加载。

模块化
-----
JS变得有用，一个很大的原因就是其能够模块化。当然，JS本身是没有这个功能的，至少目前还没有。我们采用模拟命名空间+闭包的方式来实现模块化。模块之间的依赖关系，通过依赖注入来实现，这种方式有些类似Angularjs。在处理依赖的时候，处理了两种异常，一种是对自身的依赖，一种是循环依赖。

效能
-----
引擎的效能不是我们主要考虑的问题，其实和java本身的执行效率相差不大。框架在处理数据的时候会对数据做JSON的转换，这个可能是比较消耗性能的。但是我虽然没有对比试验过，但是体验上面，似乎不会比JPA这样的技术慢（JAP也会做转换，将结果转换成对应的模型）。

对数据的变换替代各种O
-----
Java在做类似事情的时候，需要至少两种O：一种是实例PO和数据库的表中的行所对应。一种是TO这个和生成的JSON数据相关。可能还有VO，这个是对数据的验证。JS是通过underscoreJS这样的类库通过filter、map等这样函数化的处理来完成这一过程的。我认为，后者是好的，更灵活，更符合人类的逻辑能力。

如何使用
=======
induction由两部分组成，一部分是java写的，用来加载JS以及用JDK自带的JS引擎来运行这些JS，同时会返回一个String类型的结果。
另一部分是JS写的，用来处理逻辑，以及一些基本的操作，比如日志。Base.java和Base.js都是必须的。使用的时候，这两部分都要和工作的代码合并。Base.java不适合在jar包中工作，因为它需要加载很多JS文件，而这些js文件是不能打入jar包的，主要是从维护性上来考虑的。所以工作的时候你需要直接把源码拷贝到你的工作目录来。当然也可以通过IDE搞一个项目的依赖。

Java部分
-------
com.skycloud.induction.Base.java
这是java部分的基类，主要封装的JS的加载，模块化的实现，以及JS引擎的调用。

其中有一些常量是可以配置的：

    private static final String BASE_JS_PATH = "/js";
    private static final String EXECUTE_JS_PATH = "/execute";
    private static final String[] libs = {"underscore-min.js", "json2.js", "moment.min.js"};

`BASE_JS_PATH`指的是你的JS在类路径的根目录名称。

`EXECUTE_JS_PATH`你写的JS的执行目录是什么。

`libs`你需要加载的类库有哪些。

建议不要改动，但是如果你有自己新的类库需要加载的话，可以改动这个代码。但是需要注意的是，这些类库都是作为全局变量加载的。 **这个机制是暂时的，后续可能会改动**

此外还需要注意的是Base中的一个内部静态类tool：

     /**
     * 这个类是为了给JS提供一些处理Java结果的工具。
     * 其中的方法会在JS中使用。因此编译器可能会报unused的警告，可以乎略。
     */
    public static class Tool {
        /**
         * 这个工具是为了jdbcTemplate的查询结果，需要被转换成JSON字符串，以便JS处理。
         *
         * @param result 某个java对象。这里应该是jdbcTemplate的查询结果，是一个java的map对象。
         * @return JSON string
         */
        @SuppressWarnings("unused")
        public String toJSON(List result) {
            ObjectMapper mapper = new ObjectMapper();
            StringWriter writer = new StringWriter();
            try {
                mapper.writeValue(writer, result);
            } catch (IOException e) {
                e.printStackTrace();
            }
            return writer.toString();
        }
    }

这个类可以在JS中使用：`_$tool`来调用。如果你有什么特殊的方法可以放在这里，让JS调用到，但是需要注意参数尽可能是字符串。（ **这个机制是暂时的** ）

真正在工作中需要自己实现一个Base.java的子类，比如项目中的Executor类。

    public class Executor extends Base {

    @Override
    public Object setParametersAndCall(String key, String parameters) {
        putObjectToJS("_$test","test ");
        return executeMethod(key, "execute(" + parameters + ")");
    }

    public static void main(String[] args) {
        Executor executor = new Executor();
        Object rs = executor.execute("main", "");
        System.out.println("rs = " + rs);
    }}

**注意**`putObjectToJS("_$test","test ");`这句，这句的意思是向JS中注入一个java的对象。这个对象在JS中可以使用`_$test`这个变量名称访问。注意，这是一个全局变量，所以我们给了一个特殊的开头，以便标记。

















