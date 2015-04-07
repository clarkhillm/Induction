package com.skycloud.storage.toponew.task;


import com.skycloud.storage.toponew.induction.Executor;

/**
 * a wrapper for task .
 * Created by gavin on 4/7/15.
 */
public class generateRelationsTask {
    private Executor executor;

    public void setExecutor(Executor executor) {
        this.executor = executor;
    }

    public void execute() {
        executor.execute(this.getClass().getSimpleName(), "");
    }
}
